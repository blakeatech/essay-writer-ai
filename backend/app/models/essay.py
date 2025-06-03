from pydantic import BaseModel
from typing import List
from app.models.outline import OutlineResponse
from app.models.source import Source

class EssayRequest(BaseModel):
    title: str
    word_count: int
    outline: OutlineResponse
    sources: List[Source]
    writing_analysis: str

class Section(BaseModel):
    main_idea: str
    subtopics: List[str]
