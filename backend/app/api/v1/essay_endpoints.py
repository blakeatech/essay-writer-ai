from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Body, Request
from typing import List, Optional
from app.models.essay import EssayRequest, OutlineResponse, Source
from app.services.draft_service import DraftService
from app.services.document_service import DocumentService
from app.utils.auth import get_current_user
from app.services.supabase_service import save_paper
from app.services.guardrail_service import GuardrailService, GuardrailResponse
from app.services.supabase_service import supabase
import os
import uuid
import tempfile
import logging
from decimal import Decimal

from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/api/v1")
logger = logging.getLogger(__name__)

# Add a dictionary to store essay generation progress
essay_progress = {}

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/generate-essay")
@limiter.limit("5/minute")  # Limit to 5 requests per minute per IP
async def generate_essay(
    request: Request,  # Add this parameter for rate limiting
    background_tasks: BackgroundTasks,
    essay_request: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Generate an essay based on the outline, sources, writing style, and word count"""
    try:
        # Generate a unique job ID
        job_id = str(uuid.uuid4())
        
        logger.info(f"Starting new essay generation job {job_id}")

        user_id = current_user["id"]
        
        response = supabase.table("user_profiles").select("credits").eq("id", user_id).execute()

        if not response.data:
            return {"error": "Insufficient credits. Please purchase credits to continue."}

        guardrail_service = GuardrailService()
        guardrail_response = guardrail_service.moderate_prompt(essay_request["title"], essay_request["outline"], essay_request["sources"])

        if guardrail_response == GuardrailResponse.MALICIOUS:
            return {"error": "Malicious prompt. Please try again with a different prompt."}
        
        user_credits = response.data[0]["credits"]

        # Check if user has at least 1 credit
        if user_credits <= 0:
            return {"error": "Insufficient credits. Please purchase credits to continue."}
        
        # Initialize progress tracking
        essay_progress[job_id] = {
            "status": "processing",
            "progress": 0,
            "stage": "starting",
            "result": None,
            "error": None
        }
        
        # Add the background task
        background_tasks.add_task(
            process_essay_generation,
            job_id,
            essay_request,
            current_user
        )
        
        # Return the job ID immediately
        return {"job_id": job_id, "status": "processing"}
        
    except Exception as e:
        logger.error(f"Error in generate-essay endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate essay: {str(e)}")

def process_essay_generation(
    job_id: str,
    essay_request: dict,
    current_user: dict
):
    """Background task to process essay generation"""
    try:
        # Use global essay_progress to ensure we're updating the same dictionary
        global essay_progress
        
        # Update progress
        logger.info(f"Essay Job {job_id}: Starting essay generation")
        essay_progress[job_id]["stage"] = "writing_essay"
        essay_progress[job_id]["progress"] = 10
        
        # Extract request data
        title = essay_request.get("title")
        outline = essay_request.get("outline")
        sources = essay_request.get("sources")
        student_name = essay_request.get("studentName")
        professor_name = essay_request.get("professorName")
        class_name = essay_request.get("className")
        writing_analysis = essay_request.get("writing_analysis")
        citation_format = essay_request.get("citation_format")
        word_count = essay_request.get("word_count")
        # Validate input
        if not title or not outline or not sources:
            raise ValueError("Missing required fields")
        
        # Create essay request object
        from app.models.essay import EssayRequest, OutlineResponse, Source
        
        # Convert the outline and sources to the appropriate models
        outline_obj = OutlineResponse(**outline) if isinstance(outline, dict) else outline
        sources_obj = [Source(**s) if isinstance(s, dict) else s for s in sources]
        
        essay_req = EssayRequest(
            title=title,
            word_count=word_count,
            outline=outline_obj,
            sources=sources_obj,
            writing_analysis=writing_analysis
        )
        
        # Update progress
        essay_progress[job_id]["progress"] = 30
        
        # Generate draft
        from app.services.draft_service import DraftService
        draft_service = DraftService(essay_req)
        draft = draft_service.generate_draft()
        
        # Update progress
        essay_progress[job_id]["stage"] = "checking_plagiarism"
        essay_progress[job_id]["progress"] = 60
        
        # Create a temporary file for the document
        import tempfile
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
        temp_file_path = temp_file.name
        temp_file.close()
        
        # Create document
        from app.services.document_service import DocumentService
        doc_service = DocumentService(
            title=title,
            content=draft,
            sources=sources_obj,
            student_name=student_name,
            professor_name=professor_name,
            class_name=class_name
        )
        doc_service.create_document(temp_file_path)
        
        # Update progress
        essay_progress[job_id]["stage"] = "finalizing"
        essay_progress[job_id]["progress"] = 80
        
        # Save paper to Supabase with user authentication
        from app.services.supabase_service import save_paper
        paper_data = {
            "title": title,
            "description": f"Essay on {title}",
            "word_count": len(draft.split()),
            "citation_format": citation_format
        }
        
        # Save paper to Supabase and get the response
        saved_paper = save_paper(current_user["id"], paper_data, temp_file_path)
        
        # Clean up the temporary file
        try:
            import os
            os.unlink(temp_file_path)
        except Exception as e:
            logger.error(f"Error deleting temporary file: {str(e)}")
        
        # Set final result
        result = {
            "message": "Essay generated successfully",
            "paper_id": saved_paper[0]["id"] if saved_paper else None,
            "title": title,
            "storage_url": saved_paper[0]["storage_url"] if saved_paper else None,
            "word_count": paper_data["word_count"]
        }
        
        # Update progress
        essay_progress[job_id]["status"] = "completed"
        essay_progress[job_id]["progress"] = 100
        essay_progress[job_id]["stage"] = "completed"
        essay_progress[job_id]["result"] = result

        # Deduct 1 credit from user's account after successful completion
        try:
            # Get user's current credits
            response = supabase.table("user_profiles").select("credits").eq("id", user_id).execute()
            
            if response.data:
                current_credits = response.data[0]["credits"]
                
                supabase.table("user_profiles").update({"credits": current_credits - 1}).eq("id", user_id).execute()
                logger.info(f"Essay Job {job_id}: Deducted 1 credit from user {user_id}, new balance: {current_credits - 1}")
            else:
                logger.error(f"Essay Job {job_id}: Could not find user profile for user {user_id}")
        except Exception as e:
            logger.error(f"Essay Job {job_id}: Error deducting credit: {str(e)}")
        
    except Exception as e:
        logger.error(f"Essay Job {job_id}: Error processing essay generation: {str(e)}", exc_info=True)
        essay_progress[job_id]["status"] = "failed"
        essay_progress[job_id]["error"] = str(e)

@router.get("/essay-status/{job_id}")
@limiter.limit("200/minute")  # Allow more frequent status checks
async def get_essay_status(request: Request, job_id: str):
    """Get the status of an essay generation job"""
    if job_id not in essay_progress:
        logger.warning(f"Essay status request for unknown job ID: {job_id}")
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = essay_progress[job_id]
    logger.info(f"Essay status request for {job_id}: status={job['status']}, progress={job['progress']}%, stage={job['stage']}")
    
    if job["status"] == "completed" and job["result"]:
        # Return the full result if completed
        return {
            "status": job["status"],
            "progress": job["progress"],
            "stage": job["stage"],
            "result": job["result"]
        }
    elif job["status"] == "failed":
        # Return the error if failed
        return {
            "status": job["status"],
            "progress": job["progress"],
            "stage": job["stage"],
            "error": job["error"]
        }
    else:
        # Return just the progress info if still processing
        return {
            "status": job["status"],
            "progress": job["progress"],
            "stage": job["stage"]
        }