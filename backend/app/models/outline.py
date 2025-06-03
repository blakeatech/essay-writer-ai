from pydantic import BaseModel
from typing import List

class OutlineComponent(BaseModel):
    main_idea: str
    subtopics: List[str]

class OutlineResponse(BaseModel):
    outline_components: List[OutlineComponent] 

class OutlineRequest(BaseModel):
    topic: str
    assignment_description: str
    writing_style: str
    word_count: int
    previous_essay: str
