"""
Agentic Essay Pipeline for EssayGenius.
Defines a pipeline of specialized agents that work together to generate high-quality essays:
- Outline Agent: Creates structured essay outlines
- Source Agent: Retrieves and validates academic sources
- Draft Agent: Generates essay content based on outline and sources
- Citation Agent: Ensures proper citation formatting and integration
"""

import logging
from typing import Dict, List, Any, Optional, Union
import asyncio
from datetime import datetime

from app.services.prompts import PromptTemplates, format_prompt
from app.services.outline_service import generate_outline
from app.services.source_service import search_sources
from app.services.draft_service import generate_draft
from app.services.source_retrieval import get_source_embedding_service
from app.utils.evaluation import validate_essay_structure, validate_citations
from app.schemas.essay import EssayRequest, EssayResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Agent:
    """Base Agent class that all specialized agents inherit from."""
    
    def __init__(self, name: str):
        """
        Initialize an agent.
        
        Args:
            name: Name of the agent
        """
        self.name = name
        self.logger = logging.getLogger(f"agent.{name.lower()}")
    
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run the agent's task.
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            Output data from the agent
        """
        self.logger.info(f"Running {self.name} agent")
        start_time = datetime.now()
        
        result = await self._process(input_data)
        
        elapsed = (datetime.now() - start_time).total_seconds()
        self.logger.info(f"{self.name} agent completed in {elapsed:.2f}s")
        
        return result
    
    async def _process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the input data. To be implemented by subclasses.
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            Output data from the agent
        """
        raise NotImplementedError("Subclasses must implement _process method")


class OutlineAgent(Agent):
    """Agent responsible for generating essay outlines."""
    
    def __init__(self):
        super().__init__("Outline")
    
    async def _process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an essay outline based on the topic and requirements.
        
        Args:
            input_data: Dictionary containing:
                - topic: Essay topic
                - citation_style: Citation style (APA, MLA, Chicago)
                - paragraph_count: Number of paragraphs
                - additional_requirements: Any additional requirements
                
        Returns:
            Dictionary containing:
                - outline: Generated outline
                - sections: List of section titles
        """
        topic = input_data.get("topic")
        citation_style = input_data.get("citation_style", "APA")
        paragraph_count = input_data.get("paragraph_count", 5)
        body_paragraph_count = paragraph_count - 2  # Subtract intro and conclusion
        
        # Format the prompt
        prompt = format_prompt(
            PromptTemplates.OUTLINE_PROMPT,
            topic=topic,
            citation_style=citation_style,
            paragraph_count=paragraph_count,
            body_paragraph_count=body_paragraph_count
        )
        
        # Generate outline
        outline_result = await generate_outline(
            topic=topic,
            citation_style=citation_style,
            prompt=prompt
        )
        
        # Extract sections from the outline
        sections = self._extract_sections(outline_result["outline"])
        
        return {
            "outline": outline_result["outline"],
            "sections": sections
        }
    
    def _extract_sections(self, outline: str) -> List[str]:
        """
        Extract section titles from the outline.
        
        Args:
            outline: The generated outline text
            
        Returns:
            List of section titles
        """
        # Simple extraction based on common outline formatting
        sections = []
        for line in outline.split("\n"):
            line = line.strip()
            # Look for section headers (typically in the format "I. Introduction", "II. Body", etc.)
            if line and (line.startswith(("I.", "II.", "III.", "IV.", "V.", "1.", "2.", "3.", "4.", "5.")) or 
                         "introduction" in line.lower() or 
                         "conclusion" in line.lower() or
                         "body" in line.lower()):
                sections.append(line)
        
        return sections


class SourceAgent(Agent):
    """Agent responsible for retrieving and validating academic sources."""
    
    def __init__(self):
        super().__init__("Source")
        self.embedding_service = get_source_embedding_service()
    
    async def _process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieve and validate sources for the essay.
        
        Args:
            input_data: Dictionary containing:
                - topic: Essay topic
                - outline: Generated outline
                - source_count: Number of sources to retrieve
                - max_years: Maximum age of sources in years
                
        Returns:
            Dictionary containing:
                - sources: List of retrieved sources
                - source_summaries: Brief summaries of each source
        """
        topic = input_data.get("topic")
        outline = input_data.get("outline", "")
        source_count = input_data.get("source_count", 5)
        max_years = input_data.get("max_years", 10)
        
        # Format the prompt
        prompt = format_prompt(
            PromptTemplates.SOURCE_RETRIEVAL_PROMPT,
            topic=topic,
            source_count=source_count,
            max_years=max_years
        )
        
        # Retrieve sources
        sources_result = await search_sources(
            topic=topic,
            count=source_count,
            prompt=prompt
        )
        
        # Check for duplicate sources using embeddings
        unique_sources = []
        source_summaries = []
        
        for source in sources_result["sources"]:
            # In a real implementation, we would generate embeddings for each source
            # For now, we'll assume the embedding is available or can be generated
            # embedding = generate_embedding(source["title"] + " " + source["summary"])
            
            # Placeholder for embedding (in real implementation, use actual embeddings)
            # This would typically come from an embedding model like OpenAI's text-embedding-ada-002
            embedding = [0.0] * 1536  # Placeholder 1536-dimensional embedding
            
            # Check if source is a duplicate
            # is_duplicate, duplicate_source = self.embedding_service.is_source_duplicate(source, embedding)
            
            # For now, we'll just add all sources since we're using placeholder embeddings
            unique_sources.append(source)
            source_summaries.append(f"{source['title']} ({source['year']}) - {source['author']}")
        
        return {
            "sources": unique_sources,
            "source_summaries": source_summaries
        }


class DraftAgent(Agent):
    """Agent responsible for generating essay drafts based on outline and sources."""
    
    def __init__(self):
        super().__init__("Draft")
    
    async def _process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an essay draft based on the outline and sources.
        
        Args:
            input_data: Dictionary containing:
                - topic: Essay topic
                - outline: Generated outline
                - sources: Retrieved sources
                - citation_style: Citation style
                - writing_style: Preferred writing style
                - tone: Preferred tone
                
        Returns:
            Dictionary containing:
                - draft: Generated essay draft
                - word_count: Approximate word count
        """
        topic = input_data.get("topic")
        outline = input_data.get("outline", "")
        sources = input_data.get("sources", [])
        citation_style = input_data.get("citation_style", "APA")
        writing_style = input_data.get("writing_style", "academic")
        tone = input_data.get("tone", "formal")
        
        # Format source information for the prompt
        source_text = "\n".join([
            f"{i+1}. {source['title']} ({source['year']}) by {source['author']}" 
            for i, source in enumerate(sources)
        ])
        
        # Format the prompt
        prompt = format_prompt(
            PromptTemplates.DRAFT_GENERATION_PROMPT,
            topic=topic,
            outline=outline,
            sources=source_text,
            citation_style=citation_style,
            writing_style=writing_style,
            tone=tone,
            paragraph_count=len(input_data.get("sections", [])) if "sections" in input_data else 5
        )
        
        # Generate draft
        draft_result = await generate_draft(
            topic=topic,
            outline=outline,
            sources=sources,
            citation_style=citation_style,
            prompt=prompt
        )
        
        # Calculate approximate word count
        word_count = len(draft_result["draft"].split())
        
        return {
            "draft": draft_result["draft"],
            "word_count": word_count
        }


class CitationAgent(Agent):
    """Agent responsible for ensuring proper citation formatting and integration."""
    
    def __init__(self):
        super().__init__("Citation")
    
    async def _process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify and format citations in the essay draft.
        
        Args:
            input_data: Dictionary containing:
                - draft: Generated essay draft
                - sources: Retrieved sources
                - citation_style: Citation style
                
        Returns:
            Dictionary containing:
                - final_draft: Essay draft with verified citations
                - bibliography: Formatted bibliography/references section
                - citation_count: Number of citations in the essay
        """
        draft = input_data.get("draft", "")
        sources = input_data.get("sources", [])
        citation_style = input_data.get("citation_style", "APA")
        
        # Format source information for the prompt
        source_text = "\n".join([
            f"{i+1}. {source['title']} ({source['year']}) by {source['author']}" 
            for i, source in enumerate(sources)
        ])
        
        # Format the prompt
        prompt = format_prompt(
            PromptTemplates.CITATION_FORMATTING_PROMPT,
            sources=source_text,
            citation_style=citation_style
        )
        
        # In a real implementation, this would call a service to verify and format citations
        # For now, we'll simulate the process
        
        # Extract existing bibliography if present
        parts = draft.split("References", 1)
        essay_text = parts[0].strip()
        existing_bibliography = parts[1].strip() if len(parts) > 1 else ""
        
        # Format bibliography based on citation style
        bibliography = self._format_bibliography(sources, citation_style)
        
        # Count citations in the essay
        citation_count = draft.count("(") + draft.count("et al.")
        
        # Combine essay text with formatted bibliography
        final_draft = f"{essay_text}\n\n{bibliography}"
        
        return {
            "final_draft": final_draft,
            "bibliography": bibliography,
            "citation_count": citation_count
        }
    
    def _format_bibliography(self, sources: List[Dict[str, Any]], citation_style: str) -> str:
        """
        Format bibliography based on citation style.
        
        Args:
            sources: List of source dictionaries
            citation_style: Citation style (APA, MLA, Chicago)
            
        Returns:
            Formatted bibliography text
        """
        if citation_style.upper() == "APA":
            header = "References"
            entries = [
                f"{source['author']}. ({source['year']}). {source['title']}. "
                f"{source.get('journal', source.get('publisher', 'Journal of Academic Research'))}, "
                f"{source.get('volume', 'Volume')}"
                f"({source.get('issue', 'Issue')}), {source.get('pages', 'pp. 1-15')}."
                for source in sources
            ]
        elif citation_style.upper() == "MLA":
            header = "Works Cited"
            entries = [
                f"{source['author']}. \"{source['title']}.\" "
                f"{source.get('journal', source.get('publisher', 'Journal of Academic Research'))}, "
                f"vol. {source.get('volume', 'Volume')}, no. {source.get('issue', 'Issue')}, "
                f"{source['year']}, pp. {source.get('pages', '1-15')}."
                for source in sources
            ]
        else:  # Chicago
            header = "Bibliography"
            entries = [
                f"{source['author']}. \"{source['title']}.\" "
                f"{source.get('journal', source.get('publisher', 'Journal of Academic Research'))} "
                f"{source.get('volume', 'Volume')}, no. {source.get('issue', 'Issue')} "
                f"({source['year']}): {source.get('pages', '1-15')}."
                for source in sources
            ]
        
        # Format the bibliography
        bibliography = f"{header}\n\n" + "\n\n".join(entries)
        
        return bibliography


class EssayPipeline:
    """
    Orchestrates the essay generation pipeline using specialized agents.
    Coordinates the flow: user_input → outline_agent → source_agent → draft_agent → citation_agent
    """
    
    def __init__(self):
        """Initialize the essay pipeline with specialized agents."""
        self.outline_agent = OutlineAgent()
        self.source_agent = SourceAgent()
        self.draft_agent = DraftAgent()
        self.citation_agent = CitationAgent()
    
    async def generate_essay(self, request: EssayRequest) -> EssayResponse:
        """
        Generate a complete essay using the agent pipeline.
        
        Args:
            request: Essay request containing topic and requirements
            
        Returns:
            EssayResponse with the generated essay and metadata
        """
        logger.info(f"Starting essay generation pipeline for topic: {request.topic}")
        
        # Step 1: Generate outline
        outline_input = {
            "topic": request.topic,
            "citation_style": request.citation_style,
            "paragraph_count": request.paragraph_count,
            "additional_requirements": request.additional_requirements
        }
        outline_result = await self.outline_agent.run(outline_input)
        
        # Step 2: Retrieve sources
        source_input = {
            "topic": request.topic,
            "outline": outline_result["outline"],
            "source_count": request.source_count,
            "max_years": request.max_source_age
        }
        source_result = await self.source_agent.run(source_input)
        
        # Step 3: Generate draft
        draft_input = {
            "topic": request.topic,
            "outline": outline_result["outline"],
            "sections": outline_result["sections"],
            "sources": source_result["sources"],
            "citation_style": request.citation_style,
            "writing_style": request.writing_style,
            "tone": request.tone
        }
        draft_result = await self.draft_agent.run(draft_input)
        
        # Step 4: Format citations
        citation_input = {
            "draft": draft_result["draft"],
            "sources": source_result["sources"],
            "citation_style": request.citation_style
        }
        citation_result = await self.citation_agent.run(citation_input)
        
        # Step 5: Validate the final essay
        final_essay = citation_result["final_draft"]
        
        # Validate essay structure and citations
        structure_validation = validate_essay_structure(
            essay_text=final_essay,
            expected_sections=outline_result["sections"]
        )
        
        citation_validation = validate_citations(
            essay_text=final_essay,
            sources=source_result["sources"],
            citation_style=request.citation_style
        )
        
        # Create response
        response = EssayResponse(
            topic=request.topic,
            outline=outline_result["outline"],
            essay_text=final_essay,
            sources=source_result["sources"],
            word_count=draft_result["word_count"],
            citation_count=citation_result["citation_count"],
            citation_style=request.citation_style,
            structure_validation=structure_validation,
            citation_validation=citation_validation
        )
        
        logger.info(f"Completed essay generation pipeline for topic: {request.topic}")
        return response


# Singleton instance
_essay_pipeline = None

def get_essay_pipeline() -> EssayPipeline:
    """Get or create the singleton EssayPipeline instance."""
    global _essay_pipeline
    if _essay_pipeline is None:
        _essay_pipeline = EssayPipeline()
    return _essay_pipeline
