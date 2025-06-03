from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request, Query
from fastapi.responses import FileResponse, JSONResponse
import os
import uuid
import logging
from app.schemas.paper import GeneratePaperRequest, GeneratePaperResponse, JobStatus
from app.services.paper_generator import PaperGeneratorService
from app.utils.auth import get_current_user
from app.services.supabase_service import (
    save_paper, 
    get_user_papers, 
    upload_paper_file, 
    download_paper_file,
)
from supabase import create_client
from app.core.config import settings
from app.services.credits_service import CreditsService
import stripe
from pydantic import BaseModel
from app.core.limiter import limiter
from app.api.v1 import stripe_endpoints

supabase_service = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1")

# Store job statuses
job_statuses: dict = {}

# Create paper generator service
paper_generator = PaperGeneratorService()

stripe.api_key = settings.STRIPE_SECRET_KEY

class CheckoutData(BaseModel):
    quantity: int

@router.post("/generate-paper", response_model=GeneratePaperResponse)
@limiter.limit("5/minute")
async def generate_paper(
    request: Request,
    paper_request: GeneratePaperRequest, 
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a paper based on the provided details.
    Returns a job ID for tracking the generation progress.
    """
    try:
        # Check credits
        if not await CreditsService.deduct_credit(current_user["id"]):
            raise HTTPException(status_code=403, detail="Insufficient credits")
            
        # Generate a unique job ID
        job_id = str(uuid.uuid4())
        
        # Start paper generation in the background
        background_tasks.add_task(
            paper_generator.generate_paper, 
            job_id, 
            request, 
            job_statuses,
            current_user["id"]  # Pass user ID to associate paper with user
        )
        
        # Return job ID
        return GeneratePaperResponse(
            message="Paper generation started",
            job_id=job_id,
            status="processing"
        )
        
    except Exception as e:
        logger.error(f"Error starting paper generation: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "An error occurred while generating the paper"}
        )

@router.get("/job-status/{job_id}", response_model=JobStatus)
@limiter.limit("50/minute")
async def get_job_status(request: Request, job_id: str, current_user: dict = Depends(get_current_user)):
    """Get the status of a paper generation job"""
    if job_id not in job_statuses:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job_statuses[job_id]

@router.get("/download-paper/{storage_url:path}")
@limiter.limit("50/minute")
async def download_paper(
    request: Request,
    storage_url: str, 
    current_user: dict = Depends(get_current_user)
):
    """Download a paper from Supabase storage in either PDF or DOCX format"""
    try:
        # First verify this paper belongs to the user
        paper = await verify_paper_ownership(storage_url, current_user["id"])
        if not paper:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this paper"
            )
        
        # Download from Supabase
        temp_file = await download_paper_file(storage_url)
        
        # Set correct mime type and extension based on format
        mime_types = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        
        # Return the file with proper headers for download
        return FileResponse(
            path=temp_file,
            filename=f"{paper['title']}.docx",
            media_type=mime_types['docx'],
            headers={
                "Content-Disposition": f'attachment; filename="{paper["title"]}.docx"'
            }
        )
        
    except Exception as e:
        logger.error(f"Error downloading paper: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error downloading paper"
        )

async def verify_paper_ownership(storage_url: str, user_id: str) -> dict:
    """Verify that a paper belongs to the user"""
    try:
        # Query the papers table to verify ownership (remove await)
        paper = supabase_service.table("papers") \
            .select("*") \
            .eq("storage_url", storage_url) \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        return paper.data if paper.data else None
        
    except Exception as e:
        logger.error(f"Error verifying paper ownership: {str(e)}", exc_info=True)
        return None

@router.get("/my-papers")
@limiter.limit("20/minute")
async def get_my_papers(request: Request, current_user: dict = Depends(get_current_user)):
    """Get all papers for the current user"""
    papers = get_user_papers(current_user["id"])
    return {"papers": papers}

@router.get("/health")
@limiter.limit("20/minute")
async def health_check(request: Request):
    """Health check endpoint"""
    return {"status": "healthy"}

@router.get("/credits")
@limiter.limit("20/minute")
async def get_credits(request: Request, current_user: dict = Depends(get_current_user)):
    return {"credits": await CreditsService.get_user_credits(current_user["id"])}

@router.post("/create-checkout-session")
@limiter.limit("20/minute")
async def create_checkout_session(
    request: Request,
    data: CheckoutData,
    current_user: dict = Depends(get_current_user)
):
    try:
        checkout_session = stripe.checkout.Session.create(
            line_items=[{
                'price': settings.STRIPE_PRICE_ID,
                'quantity': data.quantity,
            }],
            mode='payment',
            success_url=f'{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{settings.FRONTEND_URL}/dashboard/buy-credits',
            metadata={
                'user_id': current_user["id"],
                'credit_amount': data.quantity
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
@limiter.limit("20/minute")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata']['user_id']
        credit_amount = int(session['metadata']['credit_amount'])
        await CreditsService.add_credits(user_id, credit_amount)

    return {"status": "success"}

# Add this line where you include your routers
app.include_router(stripe_endpoints.router) 