from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request, Query
from fastapi.responses import FileResponse, JSONResponse
import os
import uuid
import logging
from app.schemas.paper import GeneratePaperRequest, GeneratePaperResponse, JobStatus
from app.models.outline import OutlineRequest, OutlineResponse
from app.services.outline_service import OutlineService
from app.services.source_service import SourceService
from app.models.source import Source
from typing import Optional, List
from app.schemas.essay import CitationFormat
import time
import asyncio
from app.services.supabase_service import supabase
from app.utils.auth import get_current_user
from app.services.guardrail_service import GuardrailService, GuardrailResponse
from decimal import Decimal

# Import rate limiting components
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/v1")

# Add a dictionary to store job progress - make it global and accessible
job_progress = {}

@router.get("/get-credits")
async def get_credits(current_user: dict = Depends(get_current_user)):
    """Get the number of credits a user has"""
    try:
        user_id = current_user["id"]
        response = supabase.table("user_profiles").select("credits").eq("id", user_id).execute()
        return response.data[0]["credits"]
    except Exception as e:
        logger.error(f"Error getting credits: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get credits: {str(e)}")
        # If user doesn't have a profile record, return 2 since they most likely just signed up
        return 2

@router.get("/outline-and-sources")
@limiter.limit("5/minute")  # Limit to 5 requests per minute per IP
async def get_outline_and_sources(
    request: Request,  # Required for rate limiting
    background_tasks: BackgroundTasks,
    topic: str = Query(..., description="Essay topic/title"),
    assignment_description: Optional[str] = Query(None, description="Description of the assignment requirements if available"),
    writing_style: str = Query(..., description="Preferred writing style (e.g., academic, casual, persuasive)"),
    word_count: int = Query(..., gt=0, description="Target word count for the essay"),
    previous_essay: Optional[str] = Query(None, description="Previous essay sample to analyze writing patterns"),
    citation_format: CitationFormat = Query(default=CitationFormat.APA, description="Preferred citation format"),
    num_sources: int = Query(default=3, ge=1, le=5, description="Number of sources to find (1-5)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get an outline and sources for an essay
    """
    try:
        # Generate a unique job ID
        job_id = str(uuid.uuid4())
        
        logger.info(f"Starting new job {job_id} for topic: {topic}")

        user_id = current_user["id"]

        # Get user's credits from user_profiles table
        response = supabase.table("user_profiles").select("credits").eq("id", user_id).execute()
        
        # If user doesn't have a profile record, return error
        if not response.data:
            return {"error": "Insufficient credits. Please purchase credits to continue."}

        guardrail_service = GuardrailService()
        guardrail_response = guardrail_service.moderate_prompt(topic, assignment_description, previous_essay)

        if guardrail_response == GuardrailResponse.MALICIOUS:
            return {"error": "Malicious prompt. Please try again with a different prompt."}

        user_credits = response.data[0]["credits"]

        # Check if user has at least 1 credit
        if user_credits <= 0:
            return {"error": "Insufficient credits. Please purchase credits to continue."}
                
        # Initialize progress tracking - make sure this is properly set
        job_progress[job_id] = {
            "status": "processing",
            "progress": 0,
            "stage": "starting",
            "result": None,
            "error": None
        }
        
        # Add the background task
        background_tasks.add_task(
            process_outline_and_sources, 
            job_id, 
            topic, 
            assignment_description, 
            writing_style, 
            word_count, 
            previous_essay,
            citation_format,
            num_sources,
            user_id
        )
        
        # Return the job ID immediately
        return {"job_id": job_id, "status": "processing"}
        
    except Exception as e:
        logger.error(f"Error in outline-and-sources endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate outline and sources: {str(e)}")

# Make this a regular function, not async, to ensure it runs properly in the background
def process_outline_and_sources(
    job_id: str,
    topic: str,
    assignment_description: Optional[str],
    writing_style: str,
    word_count: int,
    previous_essay: Optional[str],
    citation_format: CitationFormat,
    num_sources: int,
    user_id: str  # Add user_id parameter
):
    """Background task to process outline and sources request"""
    try:
        # Use global job_progress to ensure we're updating the same dictionary
        global job_progress
        
        # Update progress - explicitly log each update
        logger.info(f"Job {job_id}: Starting outline creation")
        job_progress[job_id]["stage"] = "creating_outline"
        job_progress[job_id]["progress"] = 10
        logger.info(f"Job {job_id}: Progress updated to 10%")
        
        # Create outline request object
        outline_request = OutlineRequest(
            topic=topic,
            assignment_description=assignment_description or "",
            writing_style=writing_style,
            word_count=word_count,
            previous_essay=previous_essay or ""
        )
        
        # Generate outline
        logger.info(f"Job {job_id}: Calling outline service")
        job_progress[job_id]["progress"] = 30
        logger.info(f"Job {job_id}: Progress updated to 30%")
        
        outline_service = OutlineService()
        outline = outline_service.generate_outline(outline_request)
        
        if not outline or not outline.outline_components:
            logger.error(f"Job {job_id}: Failed to generate outline - empty result")
            job_progress[job_id]["status"] = "failed"
            job_progress[job_id]["error"] = "Failed to generate outline"
            return
        
        logger.info(f"Job {job_id}: Outline generated with {len(outline.outline_components)} components")
        
        # Update progress
        job_progress[job_id]["stage"] = "finding_sources"
        job_progress[job_id]["progress"] = 50
        logger.info(f"Job {job_id}: Progress updated to 50%, starting source search")
        
        # Find sources
        source_service = SourceService()
        all_sources = []
        
        progress_increment = min(40 / max(len(outline.outline_components), 1), 10)
        current_progress = 50

        for i, section in enumerate(outline.outline_components):
            logger.info(f"Job {job_id}: Finding sources for section {i+1}/{len(outline.outline_components)}: {section.main_idea}")
            prompt = f"""
            Main Idea: {section.main_idea}
            Supporting Points:
            """
            for point in section.subtopics:
                prompt += f"{point}\n"
                
            try:
                sources = source_service.find_sources(prompt, num_sources, citation_format)
                all_sources.append(sources)
                
                current_progress += progress_increment
                job_progress[job_id]["progress"] = min(int(current_progress), 90)
                logger.info(f"Job {job_id}: Progress updated to {job_progress[job_id]['progress']}%")
                
            except Exception as e:
                logger.error(f"Job {job_id}: Error finding sources for section {i+1}: {str(e)}")
                # Continue with other sections even if one fails

        # Find writing style
        writing_analysis = outline_service.get_writing_style_analysis(previous_essay)
        
        # Set final result
        result = {
            "outline": outline,
            "sources": all_sources,
            "writing_analysis": writing_analysis
        }
        
        logger.info(f"Job {job_id}: All processing completed successfully")
        job_progress[job_id]["status"] = "completed"
        job_progress[job_id]["progress"] = 100
        job_progress[job_id]["stage"] = "completed"
        job_progress[job_id]["result"] = result
        logger.info(f"Job {job_id}: Final progress set to 100%, status marked as completed")
        
        # Deduct 1 credit from user's account after successful completion
        try:
            # Get user's current credits
            response = supabase.table("user_profiles").select("credits").eq("id", user_id).execute()
            
            if response.data:
                current_credits = response.data[0]["credits"]
                supabase.table("user_profiles").update({"credits": current_credits - 1}).eq("id", user_id).execute()
                logger.info(f"Job {job_id}: Deducted 1 credit from user {user_id}, new balance: {current_credits - 1}")
            else:
                logger.error(f"Job {job_id}: Could not find user profile for user {user_id}")
        except Exception as e:
            logger.error(f"Job {job_id}: Error deducting credit: {str(e)}")
        
    except Exception as e:
        logger.error(f"Job {job_id}: Error processing outline and sources: {str(e)}", exc_info=True)
        job_progress[job_id]["status"] = "failed"
        job_progress[job_id]["error"] = str(e)
    
    # Instead of using asyncio.sleep for cleanup, we'll implement a separate cleanup mechanism
    # We can use a background task scheduler or just keep the results indefinitely for now

@router.get("/job-status/{job_id}")
@limiter.limit("200/minute")  # Allow more frequent status checks
async def get_job_status(request: Request, job_id: str):
    """Get the status of a job"""
    if job_id not in job_progress:
        logger.warning(f"Job status request for unknown job ID: {job_id}")
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_progress[job_id]
    logger.info(f"Job status request for {job_id}: status={job['status']}, progress={job['progress']}%, stage={job['stage']}")
    
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
