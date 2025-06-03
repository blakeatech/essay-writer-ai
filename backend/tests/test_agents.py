"""
Unit tests for the agentic essay pipeline.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import asyncio

from app.agents import (
    Agent, 
    OutlineAgent, 
    SourceAgent, 
    DraftAgent, 
    CitationAgent, 
    EssayPipeline,
    get_essay_pipeline
)
from app.schemas.essay import EssayRequest, EssayResponse


@pytest.fixture
def sample_essay_request():
    """Sample essay request for testing."""
    return EssayRequest(
        topic="The Impact of Artificial Intelligence on Modern Healthcare",
        citation_style="APA",
        paragraph_count=5,
        source_count=3,
        max_source_age=5,
        writing_style="academic",
        tone="formal",
        additional_requirements="Include examples of AI applications in diagnostics."
    )


class TestBaseAgent:
    """Tests for the base Agent class."""
    
    @pytest.mark.asyncio
    async def test_agent_run(self):
        """Test the run method of the base Agent class."""
        # Create a concrete implementation of Agent for testing
        class TestAgent(Agent):
            async def _process(self, input_data):
                return {"result": "processed", "input": input_data}
        
        # Create agent and test run method
        agent = TestAgent("Test")
        result = await agent.run({"test": "data"})
        
        # Assertions
        assert result["result"] == "processed"
        assert result["input"]["test"] == "data"


class TestOutlineAgentIntegration:
    """Integration tests for OutlineAgent."""
    
    @pytest.mark.asyncio
    @patch('app.agents.generate_outline')
    async def test_outline_agent_integration(self, mock_generate_outline):
        """Test the OutlineAgent with mocked dependencies."""
        # Setup mock
        mock_generate_outline.return_value = {
            "outline": "Sample outline content"
        }
        
        # Create agent and run
        agent = OutlineAgent()
        result = await agent.run({
            "topic": "Test Topic",
            "citation_style": "APA",
            "paragraph_count": 5
        })
        
        # Assertions
        assert "outline" in result
        assert "sections" in result
        mock_generate_outline.assert_called_once()


class TestSourceAgentIntegration:
    """Integration tests for SourceAgent."""
    
    @pytest.mark.asyncio
    @patch('app.agents.search_sources')
    async def test_source_agent_integration(self, mock_search_sources):
        """Test the SourceAgent with mocked dependencies."""
        # Setup mock
        mock_search_sources.return_value = {
            "sources": [
                {
                    "title": "Test Source",
                    "author": "Test Author",
                    "year": 2023,
                    "journal": "Test Journal"
                }
            ]
        }
        
        # Create agent and run
        agent = SourceAgent()
        result = await agent.run({
            "topic": "Test Topic",
            "source_count": 1
        })
        
        # Assertions
        assert "sources" in result
        assert "source_summaries" in result
        assert len(result["sources"]) == 1
        mock_search_sources.assert_called_once()


class TestDraftAgentIntegration:
    """Integration tests for DraftAgent."""
    
    @pytest.mark.asyncio
    @patch('app.agents.generate_draft')
    async def test_draft_agent_integration(self, mock_generate_draft):
        """Test the DraftAgent with mocked dependencies."""
        # Setup mock
        mock_generate_draft.return_value = {
            "draft": "Sample draft content"
        }
        
        # Create agent and run
        agent = DraftAgent()
        result = await agent.run({
            "topic": "Test Topic",
            "outline": "Sample outline",
            "sources": [{"title": "Test Source", "author": "Test Author", "year": 2023}],
            "citation_style": "APA"
        })
        
        # Assertions
        assert "draft" in result
        assert "word_count" in result
        mock_generate_draft.assert_called_once()


class TestCitationAgentIntegration:
    """Integration tests for CitationAgent."""
    
    @pytest.mark.asyncio
    async def test_citation_agent_integration(self):
        """Test the CitationAgent."""
        # Create agent and run
        agent = CitationAgent()
        result = await agent.run({
            "draft": "Sample draft with citation (Author, 2023).",
            "sources": [{"title": "Test Source", "author": "Author", "year": 2023}],
            "citation_style": "APA"
        })
        
        # Assertions
        assert "final_draft" in result
        assert "bibliography" in result
        assert "citation_count" in result
        assert "References" in result["bibliography"]


class TestEssayPipeline:
    """Tests for the EssayPipeline class."""
    
    @pytest.mark.asyncio
    @patch('app.agents.OutlineAgent.run')
    @patch('app.agents.SourceAgent.run')
    @patch('app.agents.DraftAgent.run')
    @patch('app.agents.CitationAgent.run')
    @patch('app.agents.validate_essay_structure')
    @patch('app.agents.validate_citations')
    async def test_essay_pipeline_generate_essay(
        self, 
        mock_validate_citations,
        mock_validate_structure,
        mock_citation_run,
        mock_draft_run,
        mock_source_run,
        mock_outline_run,
        sample_essay_request
    ):
        """Test the essay generation pipeline."""
        # Setup mocks
        mock_outline_run.return_value = {
            "outline": "Sample outline",
            "sections": ["Introduction", "Body", "Conclusion"]
        }
        
        mock_source_run.return_value = {
            "sources": [{"title": "Test Source", "author": "Test Author", "year": 2023}],
            "source_summaries": ["Test Source (2023) - Test Author"]
        }
        
        mock_draft_run.return_value = {
            "draft": "Sample draft content",
            "word_count": 500
        }
        
        mock_citation_run.return_value = {
            "final_draft": "Sample final draft with citations",
            "bibliography": "Sample bibliography",
            "citation_count": 3
        }
        
        mock_validate_structure.return_value = {
            "is_valid": True,
            "has_introduction": True,
            "has_conclusion": True
        }
        
        mock_validate_citations.return_value = {
            "is_valid": True,
            "has_citations": True,
            "has_bibliography": True
        }
        
        # Create pipeline and generate essay
        pipeline = EssayPipeline()
        result = await pipeline.generate_essay(sample_essay_request)
        
        # Assertions
        assert isinstance(result, EssayResponse)
        assert result.topic == sample_essay_request.topic
        assert result.outline == "Sample outline"
        assert result.essay_text == "Sample final draft with citations"
        assert result.word_count == 500
        assert result.citation_count == 3
        
        # Verify all agents were called
        mock_outline_run.assert_called_once()
        mock_source_run.assert_called_once()
        mock_draft_run.assert_called_once()
        mock_citation_run.assert_called_once()
        mock_validate_structure.assert_called_once()
        mock_validate_citations.assert_called_once()


def test_get_essay_pipeline():
    """Test the singleton essay pipeline getter."""
    pipeline1 = get_essay_pipeline()
    pipeline2 = get_essay_pipeline()
    
    # Verify singleton pattern
    assert pipeline1 is pipeline2
    assert isinstance(pipeline1, EssayPipeline)
