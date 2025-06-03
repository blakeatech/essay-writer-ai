from supabase import create_client
import os
import uuid
from datetime import datetime
from app.schemas.auth import UserCreate, UserResponse
from app.core.config import settings
import logging
import tempfile
from passlib.context import CryptContext

# Initialize password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Functions to replace the imported ones
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Initialize Supabase client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

logger = logging.getLogger(__name__)

def create_user(user: UserCreate):
    """Create a new user in Supabase"""
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Insert user into Supabase
    response = supabase.table("users").insert({
        "email": user.email,
        "password": hashed_password
    }).execute()
    
    if len(response.data) == 0:
        return None
    
    # Return user without password
    user_data = response.data[0]
    return UserResponse(id=user_data["id"], email=user_data["email"])

def get_user_by_email(email: str):
    """Get user by email"""
    response = supabase.table("users").select("*").eq("email", email).execute()
    
    if len(response.data) == 0:
        return None
    
    return response.data[0]

def authenticate_user(email: str, password: str):
    """Authenticate user"""
    user = get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

def save_paper(user_id: str, paper_data: dict, file_path: str):
    """Save paper metadata and file to Supabase"""
    try:
        # Generate unique filename
        file_name = f"{uuid.uuid4()}.docx"
        # Create storage path with user_id folder
        storage_path = f"{user_id}/{file_name}"
        
        # Upload file to storage in user's folder
        with open(file_path, 'rb') as f:
            response = supabase.storage.from_('papers').upload(storage_path, f)
        
        # Create paper record matching our actual schema
        paper_record = {
            "user_id": user_id,
            "title": paper_data["title"],
            "description": paper_data.get("description", ""),
            "status": "complete",
            "word_count": paper_data.get("word_count", 0),
            "citation_format": paper_data.get("citation_format", "APA"),
            "storage_url": storage_path,  # Store the full path including user_id folder
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert paper metadata into papers table
        response = supabase.table("papers").insert(paper_record).execute()
        
        return response.data
        
    except Exception as e:
        logger.error(f"Error saving paper: {str(e)}", exc_info=True)
        raise

def get_user_papers(user_id: str):
    """Get all papers for a user"""
    response = supabase.table("papers").select("*").eq("user_id", user_id).execute()
    return response.data

def upload_paper_file(file_path: str, user_id: str):
    """Upload paper file to Supabase storage"""
    bucket_name = "papers"
    # Create a unique filename using user_id and original filename
    file_name = f"{user_id}/{os.path.basename(file_path)}"
    
    # Upload file to Supabase storage
    with open(file_path, "rb") as file_content:
        supabase.storage.from_(bucket_name).upload(
            file_name,
            file_content,
            file_options={"content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
        )
    
    # Get public URL (or signed URL if private)
    file_url = supabase.storage.from_(bucket_name).get_public_url(file_name)
    
    return file_url

async def download_paper_file(storage_url: str) -> str:
    """Download a paper from Supabase storage to a temporary file"""
    try:
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
        temp_file.close()
        
        # Download the file from Supabase storage using the full path
        with open(temp_file.name, 'wb') as f:
            response = supabase.storage \
                .from_('papers') \
                .download(storage_url)  # storage_url already includes user_id/filename
            f.write(response)
        
        return temp_file.name
        
    except Exception as e:
        logger.error(f"Error downloading file from storage: {str(e)}", exc_info=True)
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise

def get_download_url(storage_path: str) -> str:
    """Get the public download URL for a paper"""
    try:
        return supabase.storage.from_('papers').get_public_url(storage_path)
    except Exception as e:
        logger.error(f"Error getting download URL: {str(e)}", exc_info=True)
        raise