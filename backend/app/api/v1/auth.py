from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from app.core.config import settings
from app.utils.auth import get_current_user
import httpx
from supabase import create_client, Client
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
# Initialize Supabase client with service_role key to bypass RLS
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY
)

class EmailCheckRequest(BaseModel):
    email: EmailStr

@router.get("/check-email-exists")
@limiter.limit("60/minute")
async def check_email_exists(request: Request, email: EmailStr):
    """
    Check if an email already exists in the auth system
    """
    try:
        user_profiles = supabase.table("user_profiles").select("email").eq("email", email).execute()
        
        if user_profiles.data and len(user_profiles.data) > 0:
            return {"exists": True, "message": "Email already registered"}
        
        # Email doesn't exist
        return {"exists": False}
    
    except Exception as e:
        print(f"Error checking email existence: {str(e)}")
        # Don't expose internal errors
        return {"exists": False, "error": "Could not verify email status"} 