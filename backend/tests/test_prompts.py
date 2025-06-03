"""
Unit tests for prompt templates.
"""

import pytest
from app.services.prompts import PromptTemplates, format_prompt


class TestPromptTemplates:
    """Tests for the PromptTemplates class and formatting function."""
    
    def test_outline_prompt_formatting(self):
        """Test formatting of outline prompts."""
        # Test parameters
        params = {
            "topic": "Climate Change",
            "citation_style": "APA",
            "paragraph_count": 5,
            "body_paragraph_count": 3
        }
        
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.OUTLINE_PROMPT,
            **params
        )
        
        # Assertions
        assert params["topic"] in formatted_prompt
        assert params["citation_style"] in formatted_prompt
        assert str(params["paragraph_count"]) in formatted_prompt
        assert str(params["body_paragraph_count"]) in formatted_prompt
    
    def test_outline_with_sources_prompt_formatting(self):
        """Test formatting of outline with sources prompt."""
        # Test parameters
        params = {
            "topic": "Climate Change",
            "citation_style": "MLA",
            "paragraph_count": 7,
            "body_paragraph_count": 5,
            "sources": "Source 1\nSource 2\nSource 3"
        }
        
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.OUTLINE_WITH_SOURCES_PROMPT,
            **params
        )
        
        # Assertions
        assert params["topic"] in formatted_prompt
        assert params["citation_style"] in formatted_prompt
        assert params["sources"] in formatted_prompt
        assert str(params["paragraph_count"]) in formatted_prompt
        assert str(params["body_paragraph_count"]) in formatted_prompt
    
    def test_source_retrieval_prompt_formatting(self):
        """Test formatting of source retrieval prompt."""
        # Test parameters
        params = {
            "topic": "Renewable Energy",
            "source_count": 5,
            "max_years": 10
        }
        
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.SOURCE_RETRIEVAL_PROMPT,
            **params
        )
        
        # Assertions
        assert params["topic"] in formatted_prompt
        assert str(params["source_count"]) in formatted_prompt
        assert str(params["max_years"]) in formatted_prompt
    
    def test_draft_generation_prompt_formatting(self):
        """Test formatting of draft generation prompt."""
        # Test parameters
        params = {
            "topic": "Artificial Intelligence Ethics",
            "outline": "Sample outline content",
            "sources": "Source 1\nSource 2",
            "citation_style": "Chicago",
            "writing_style": "academic",
            "tone": "formal",
            "paragraph_count": 6
        }
        
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.DRAFT_GENERATION_PROMPT,
            **params
        )
        
        # Assertions
        assert params["topic"] in formatted_prompt
        assert params["outline"] in formatted_prompt
        assert params["sources"] in formatted_prompt
        assert params["citation_style"] in formatted_prompt
        assert params["writing_style"] in formatted_prompt
        assert params["tone"] in formatted_prompt
        assert str(params["paragraph_count"]) in formatted_prompt
    
    def test_citation_formatting_prompt_formatting(self):
        """Test formatting of citation formatting prompt."""
        # Test parameters
        params = {
            "sources": "Source 1\nSource 2\nSource 3",
            "citation_style": "APA"
        }
        
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.CITATION_FORMATTING_PROMPT,
            **params
        )
        
        # Assertions
        assert params["sources"] in formatted_prompt
        assert params["citation_style"] in formatted_prompt
    
    def test_essay_evaluation_prompt_formatting(self):
        """Test formatting of essay evaluation prompt."""
        # Test parameters
        params = {
            "topic": "Digital Privacy",
            "essay_content": "Sample essay content",
            "citation_style": "MLA"
        }
        
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.ESSAY_EVALUATION_PROMPT,
            **params
        )
        
        # Assertions
        assert params["topic"] in formatted_prompt
        assert params["essay_content"] in formatted_prompt
        assert params["citation_style"] in formatted_prompt
    
    def test_format_prompt_with_missing_parameters(self):
        """Test format_prompt function with missing parameters."""
        # This should raise a KeyError
        with pytest.raises(KeyError):
            format_prompt(
                PromptTemplates.OUTLINE_PROMPT,
                topic="Missing Parameters Test"
                # Missing other required parameters
            )
    
    def test_format_prompt_with_extra_parameters(self):
        """Test format_prompt function with extra parameters."""
        # Extra parameters should be ignored
        formatted_prompt = format_prompt(
            PromptTemplates.OUTLINE_PROMPT,
            topic="Extra Parameters Test",
            citation_style="APA",
            paragraph_count=5,
            body_paragraph_count=3,
            extra_param="This should be ignored"
        )
        
        # Assertions
        assert "Extra Parameters Test" in formatted_prompt
        assert "APA" in formatted_prompt
        assert "This should be ignored" not in formatted_prompt
