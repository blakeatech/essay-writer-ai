from openai import OpenAI
import os
import logging
import requests
from app.models.source import Source, SourceResponse
from app.core.config import settings
from app.schemas.essay import CitationFormat


# Configure logging
logger = logging.getLogger(__name__)

class SourceService:
    """Service for managing sources for academic papers"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def find_sources(self, topic: str, num_sources: int = 1, citation_format: CitationFormat = CitationFormat.APA):
        """
        Find real academic sources for a given topic or subtopic using web search.
        
        Args:
            topic: The topic or subtopic to find sources for
            num_sources: Number of sources to return (1-3)
            citation_format: The desired citation format (defaults to APA)
        
        Returns:
            A SourceResponse object containing relevant academic sources
        """
        try:
            if num_sources < 1 or num_sources > 5:
                num_sources = 3  # Default to 3 if out of range
            
            logger.info(f"Finding {num_sources} sources for topic: {topic} in {citation_format} format")
            
            # First, use the search-preview model to search for academic sources
            search_response = self.client.chat.completions.create(
                model="gpt-4o-search-preview",
                web_search_options={
                    "search_context_size": "high"
                },
                messages=[
                    {"role": "system", "content": f"""You are a research librarian with expertise in finding relevant academic sources.
                    For the given topic, search for {num_sources} high-quality academic sources that would be valuable for a college-level paper.
                    Focus on peer-reviewed journal articles, books from reputable publishers, and reports from established organizations.
                    Only pick sources that have a clear author and publication year.
                    """}, 
                    {"role": "user", "content": f"Find {num_sources} academic sources for the following topic: {topic}. Include specific details about each source including title, author(s), publication information, and URL if available."}
                ]
            )
            
            # Extract the search results
            search_results = search_response.choices[0].message.content
            
            # Now, parse these results into our structured format with the appropriate citation format
            citation_instruction = f"Format the citation in {citation_format} style."
            if citation_format == CitationFormat.APA:
                citation_field = "APA citation"
                citation_format_example = "Author, A. A., & Author, B. B. (Year). Title of article. Title of Journal, volume number(issue number), page range. URL."
            elif citation_format == CitationFormat.MLA:
                citation_field = "MLA citation"
                citation_format_example = "Author's Last Name, First Name. \"Title of Article.\" Title of Journal, Volume, Issue, Year, Pages. Database, DOI or URL."
            elif citation_format == CitationFormat.CHICAGO:
                citation_field = "Chicago citation"
                citation_format_example = "Author's Last Name, First Name. \"Title of Article.\" Title of Journal Volume, no. Issue (Year): Pages. DOI or URL."
            elif citation_format == CitationFormat.HARVARD:
                citation_field = "Harvard citation"
                citation_format_example = "Author's Last Name, Initials. (Year) 'Title of article', Title of Journal, Volume(Issue), Pages. DOI or URL."
            else:
                citation_field = "APA citation"
                citation_format_example = "Author, A. A., & Author, B. B. (Year). Title of article. Title of Journal, volume number(issue number), page range. URL."
                
            parse_response = self.client.beta.chat.completions.parse(
                model="gpt-4o-2024-08-06",
                messages=[
                    {"role": "system", "content": f"""You are a research assistant who organizes bibliographic information.
                    Parse the following search results into a structured format with {num_sources} sources.
                    For each source, extract:
                    1. Title
                    2. Author(s)
                    3. Publication information (journal/publisher, year, volume, etc.)
                    4. Author last name
                    5. Publication year
                    6. URL if available
                    7. A brief explanation of how this source is relevant to the topic
                    8. {citation_field} of the source. Put the proper citation in the format of: {citation_format_example}
                    9. Details about the source (e.g. abstract, summary, etc.). Include specific details about the source that would be helpful for a college level paper.

                    {citation_instruction}
                    If any information is missing, make a reasonable inference but don't fabricate specific details.
                    """}, 
                    {"role": "user", "content": f"Topic: {topic}\n\nSearch Results:\n{search_results}"}
                ],
                response_format=SourceResponse,
            )
            
            sources = parse_response.choices[0].message.parsed
            logger.info(f"Found {len(sources.sources)} sources for topic: {topic}")
            return sources
        
        except Exception as e:
            logger.error(f"Error finding sources for topic '{topic}': {str(e)}", exc_info=True)
            # Return empty response in case of error
            return SourceResponse(sources=[])
    
    def get_source_text(self, source: Source):
        """Get the text content of a source"""
        try:
            response = requests.get(source.url, timeout=10)
            return response.text
        except Exception as e:
            logger.error(f"Error getting source text for {source.url}: {str(e)}", exc_info=True)
            return "" 