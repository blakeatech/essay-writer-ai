from pydantic import BaseModel
from typing import List
from app.schemas.essay import CitationFormat

class Source(BaseModel): 
    title: str
    author: str
    publication_info: str
    author_last_name: str
    publication_year: int
    url: str
    apa_citation: str
    relevance: str
    details: str

class SourceRequest(BaseModel):
    topic: str
    num_sources: int
    citation_format: CitationFormat

class SourceResponse(BaseModel):
    sources: List[Source] 