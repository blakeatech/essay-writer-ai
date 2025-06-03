from pydantic import BaseModel, Field
from typing import Optional

class StudentDetails(BaseModel):
    student_name: str = Field(..., description="Full name of the student")
    professor_name: str = Field(..., description="Name of the professor")
    class_name: str = Field(..., description="Class name (e.g., ENG 101)")

class PaperDetails(BaseModel):
    title: str = Field(..., description="Title of the paper")
    description: str = Field(..., description="Brief description of the paper")
    num_sections: int = Field(..., ge=3, le=10, description="Number of sections (3-10)")
    vocab_level: int = Field(..., ge=1, le=4, description="Vocabulary level (1-4)")

class GeneratePaperRequest(BaseModel):
    paper_details: PaperDetails
    student_details: StudentDetails

class GeneratePaperResponse(BaseModel):
    message: str
    job_id: str
    status: str

class JobStatus(BaseModel):
    status: str
    message: str
    file_path: Optional[str] = None
    storage_url: Optional[str] = None 