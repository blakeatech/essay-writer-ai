from openai import OpenAI
import os
import logging
import uuid
from app.models.outline import OutlineResponse, OutlineComponent
from app.models.source import SourceResponse, Source
from app.core.config import settings
from app.services.outline_service import OutlineService
from app.services.source_service import SourceService
from app.schemas.essay import CitationFormat, EssayJobStatus
from fastapi import Request
import asyncio

# Configure logging
logger = logging.getLogger(__name__)

class EssayService:
    """Service for generating essay outlines and finding sources based on writing style"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.outline_service = OutlineService()
        self.source_service = SourceService()
    
    async def generate_essay_outline(
        self, 
        job_id: str,
        request: Request,
        job_statuses: dict,
        user_id: str,
        topic: str,
        writing_style: str,
        word_count: int,
        citation_format: CitationFormat,
        num_sources: int,
        assignment_description: str = None,
        previous_essay: str = None,
    ):
        """
        Generate an essay outline and find sources based on the provided parameters
        
        Args:
            job_id: Unique identifier for this job
            request: FastAPI request object
            job_statuses: Dictionary to track job statuses
            user_id: User ID for the requesting user
            topic: Essay topic
            writing_style: Preferred writing style
            word_count: Target word count
            citation_format: Preferred citation format
            num_sources: Number of sources to find
            assignment_description: Description of the assignment (optional)
            previous_essay: Previous essay sample for writing style analysis (optional)
        """
        try:
            # Initialize job status
            job_statuses[job_id] = EssayJobStatus(
                status="processing",
                message="Analyzing writing style and generating outline..."
            )
            
            # Step 1: Analyze writing style from previous essay if provided
            writing_style_analysis = ""
            if previous_essay:
                writing_style_analysis = await self._analyze_writing_style(previous_essay)
                job_statuses[job_id].message = "Writing style analyzed, generating outline..."
            
            # Step 2: Generate enhanced description based on all inputs
            enhanced_description = self._generate_enhanced_description(
                topic, 
                assignment_description, 
                writing_style, 
                writing_style_analysis, 
                word_count
            )
            
            # Step 3: Generate outline based on enhanced description
            num_sections = max(3, word_count // 500)  # Estimate number of sections based on word count
            outline = self.outline_service.generate_outline(topic, enhanced_description, num_sections)
            
            # Update job status
            job_statuses[job_id].message = "Outline generated, finding sources..."
            
            # Step 4: Find sources for each section of the outline
            sources = await self._find_sources_for_outline(outline, topic, num_sources, citation_format)
            
            # Update job status with completed information
            job_statuses[job_id] = EssayJobStatus(
                status="completed",
                message="Essay outline and sources generated successfully",
                outline=outline,
                sources=sources
            )
            
            logger.info(f"Essay outline and sources generated for job {job_id}")
            
        except Exception as e:
            logger.error(f"Error generating essay outline: {str(e)}", exc_info=True)
            job_statuses[job_id] = EssayJobStatus(
                status="failed",
                message="Failed to generate essay outline",
                error=str(e)
            )
    
    async def _analyze_writing_style(self, previous_essay: str) -> str:
        """Analyze writing style from a previous essay"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-2024-08-06",
                messages=[
                    {"role": "system", "content": """You are an expert writing analyst. 
                    Analyze the provided essay sample and extract key characteristics of the writing style, including:
                    
                    1. Voice and tone (formal, casual, persuasive, etc.)
                    2. Sentence structure patterns (simple, complex, varied, etc.)
                    3. Vocabulary preferences (sophisticated, plain, technical, etc.)
                    4. Paragraph organization patterns
                    5. Transition word usage
                    6. Common phrases or expressions
                    7. Argumentative structures or rhetorical devices used
                    
                    Provide a concise summary that could guide creating new content that mimics this writing style."""},
                    {"role": "user", "content": f"Analyze the following essay sample for writing style characteristics:\n\n{previous_essay}"}
                ],
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error analyzing writing style: {str(e)}", exc_info=True)
            return "Unable to analyze writing style."
    
    def _generate_enhanced_description(
        self, 
        topic: str, 
        assignment_description: str,
        writing_style: str,
        writing_style_analysis: str,
        word_count: int
    ) -> str:
        """Generate an enhanced description for outline creation"""
        description = f"Topic: {topic}\n"
        
        if assignment_description:
            description += f"Assignment description: {assignment_description}\n"
        
        description += f"Preferred writing style: {writing_style}\n"
        description += f"Target word count: {word_count}\n"
        
        if writing_style_analysis:
            description += f"Writing style analysis from previous essay: {writing_style_analysis}\n"
        
        return description
    
    async def _find_sources_for_outline(
        self, 
        outline: OutlineResponse, 
        topic: str, 
        num_sources: int,
        citation_format: CitationFormat
    ) -> SourceResponse:
        """Find sources based on the outline and topic"""
        try:
            # Extract key concepts from the outline to search for sources
            search_topics = [topic]  # Start with the main topic
            
            # Add key concepts from outline components
            for component in outline.outline_components:
                search_topics.append(component.main_idea)
            
            # Select the most relevant search topics
            search_topics = search_topics[:min(3, len(search_topics))]
            
            # Find sources based on search topics with the specified citation format
            sources = self.source_service.find_sources(
                ", ".join(search_topics), 
                num_sources=num_sources,
                citation_format=citation_format
            )
            
            return sources
            
        except Exception as e:
            logger.error(f"Error finding sources for outline: {str(e)}", exc_info=True)
            return SourceResponse(sources=[]) 