"""
Unit tests for outline generation functionality.
"""

import pytest
import asyncio
from unittest.mock import patch, MagicMock

from app.services.prompts import format_prompt, PromptTemplates
from app.services.outline_service import generate_outline
from app.agents import OutlineAgent


@pytest.fixture
def sample_outline_input():
    """Sample input for outline generation tests."""
    return {
        "topic": "The Impact of Artificial Intelligence on Modern Healthcare",
        "citation_style": "APA",
        "paragraph_count": 5,
        "additional_requirements": "Include examples of AI applications in diagnostics."
    }


@pytest.fixture
def sample_outline_output():
    """Sample output for outline generation tests."""
    return {
        "outline": """
I. Introduction
   A. Brief overview of AI in healthcare
   B. Thesis statement: AI is transforming modern healthcare through improved diagnostics, 
      treatment planning, and administrative efficiency.

II. AI Applications in Diagnostics
   A. Medical imaging analysis
   B. Early disease detection
   C. Predictive analytics for patient outcomes

III. AI in Treatment Planning and Personalized Medicine
   A. Drug discovery and development
   B. Personalized treatment recommendations
   C. Surgical robots and assistance

IV. Administrative and Operational Improvements
   A. Automated scheduling and resource allocation
   B. Electronic health records management
   C. Reducing healthcare costs

V. Conclusion
   A. Summary of AI's impact on healthcare
   B. Future implications and ethical considerations
   C. Final thoughts on the integration of AI in healthcare systems
""",
        "sections": [
            "I. Introduction",
            "II. AI Applications in Diagnostics",
            "III. AI in Treatment Planning and Personalized Medicine",
            "IV. Administrative and Operational Improvements",
            "V. Conclusion"
        ]
    }


class TestOutlineService:
    """Tests for the outline service functionality."""
    
    @pytest.mark.asyncio
    @patch('app.services.outline_service.generate_outline')
    async def test_generate_outline(self, mock_generate_outline, sample_outline_input, sample_outline_output):
        """Test outline generation service."""
        # Setup mock
        mock_generate_outline.return_value = {
            "outline": sample_outline_output["outline"]
        }
        
        # Call the service
        result = await generate_outline(
            topic=sample_outline_input["topic"],
            citation_style=sample_outline_input["citation_style"],
            prompt="Test prompt"
        )
        
        # Assertions
        assert "outline" in result
        assert result["outline"] == sample_outline_output["outline"]
        mock_generate_outline.assert_called_once()


class TestOutlineAgent:
    """Tests for the OutlineAgent class."""
    
    @pytest.mark.asyncio
    @patch('app.agents.generate_outline')
    async def test_outline_agent_process(self, mock_generate_outline, sample_outline_input, sample_outline_output):
        """Test the OutlineAgent _process method."""
        # Setup mock
        mock_generate_outline.return_value = {
            "outline": sample_outline_output["outline"]
        }
        
        # Create agent and run process
        agent = OutlineAgent()
        result = await agent._process(sample_outline_input)
        
        # Assertions
        assert "outline" in result
        assert "sections" in result
        assert len(result["sections"]) > 0
        mock_generate_outline.assert_called_once()


class TestPromptTemplates:
    """Tests for prompt templates and formatting."""
    
    def test_outline_prompt_formatting(self, sample_outline_input):
        """Test formatting of outline prompts."""
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.OUTLINE_PROMPT,
            topic=sample_outline_input["topic"],
            citation_style=sample_outline_input["citation_style"],
            paragraph_count=sample_outline_input["paragraph_count"],
            body_paragraph_count=sample_outline_input["paragraph_count"] - 2
        )
        
        # Assertions
        assert sample_outline_input["topic"] in formatted_prompt
        assert sample_outline_input["citation_style"] in formatted_prompt
        assert str(sample_outline_input["paragraph_count"]) in formatted_prompt
