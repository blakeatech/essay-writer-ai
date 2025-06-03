"""
Unit tests for source retrieval functionality.
"""

import pytest
import numpy as np
import os
import tempfile
from unittest.mock import patch, MagicMock

from app.services.prompts import format_prompt, PromptTemplates
from app.services.source_service import search_sources
from app.services.source_retrieval import SourceEmbeddingService, get_source_embedding_service
from app.agents import SourceAgent


@pytest.fixture
def sample_source_input():
    """Sample input for source retrieval tests."""
    return {
        "topic": "The Impact of Artificial Intelligence on Modern Healthcare",
        "outline": "Sample outline content",
        "source_count": 3,
        "max_years": 5
    }


@pytest.fixture
def sample_sources():
    """Sample sources for testing."""
    return [
        {
            "title": "Artificial Intelligence in Healthcare: Past, Present and Future",
            "author": "Smith, J. & Johnson, A.",
            "year": 2022,
            "journal": "Journal of Medical Systems",
            "volume": "46",
            "issue": "3",
            "pages": "44-58",
            "summary": "Overview of AI applications in healthcare systems."
        },
        {
            "title": "Machine Learning for Medical Diagnostics",
            "author": "Chen, L. et al.",
            "year": 2021,
            "journal": "Nature Medicine",
            "volume": "27",
            "issue": "1",
            "pages": "89-96",
            "summary": "Applications of machine learning in medical diagnosis."
        },
        {
            "title": "Ethical Considerations in AI-Driven Healthcare",
            "author": "Williams, R. & Brown, T.",
            "year": 2023,
            "journal": "Journal of Medical Ethics",
            "volume": "49",
            "issue": "2",
            "pages": "112-120",
            "summary": "Ethical implications of AI in healthcare settings."
        }
    ]


@pytest.fixture
def temp_index_dir():
    """Create a temporary directory for FAISS index testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


class TestSourceService:
    """Tests for the source service functionality."""
    
    @pytest.mark.asyncio
    @patch('app.services.source_service.search_sources')
    async def test_search_sources(self, mock_search_sources, sample_source_input, sample_sources):
        """Test source retrieval service."""
        # Setup mock
        mock_search_sources.return_value = {
            "sources": sample_sources
        }
        
        # Call the service
        result = await search_sources(
            topic=sample_source_input["topic"],
            count=sample_source_input["source_count"],
            prompt="Test prompt"
        )
        
        # Assertions
        assert "sources" in result
        assert len(result["sources"]) == len(sample_sources)
        mock_search_sources.assert_called_once()


class TestSourceEmbeddingService:
    """Tests for the SourceEmbeddingService class."""
    
    def test_init(self, temp_index_dir):
        """Test initialization of SourceEmbeddingService."""
        service = SourceEmbeddingService(embedding_dim=128, index_path=os.path.join(temp_index_dir, "test_index"))
        assert service.embedding_dim == 128
        assert service.index is not None
        assert service.source_metadata == {}
    
    def test_add_source(self, temp_index_dir, sample_sources):
        """Test adding a source to the embedding service."""
        service = SourceEmbeddingService(embedding_dim=128, index_path=os.path.join(temp_index_dir, "test_index"))
        
        # Create a random embedding
        embedding = np.random.rand(128).astype('float32')
        
        # Add source
        source_id = service.add_source(sample_sources[0], embedding)
        
        # Assertions
        assert source_id is not None
        assert service.index.ntotal == 1
        assert len(service.source_metadata) == 1
        assert source_id in service.source_metadata
    
    def test_find_similar_sources(self, temp_index_dir, sample_sources):
        """Test finding similar sources."""
        service = SourceEmbeddingService(embedding_dim=128, index_path=os.path.join(temp_index_dir, "test_index"))
        
        # Add multiple sources with different embeddings
        embeddings = []
        for i in range(3):
            embedding = np.random.rand(128).astype('float32')
            embeddings.append(embedding)
            service.add_source(sample_sources[i], embedding)
        
        # Find similar sources to the first embedding
        similar = service.find_similar_sources(embeddings[0], k=2, threshold=0.0)  # Low threshold to ensure matches
        
        # Assertions
        assert len(similar) > 0
    
    def test_is_source_duplicate(self, temp_index_dir, sample_sources):
        """Test duplicate source detection."""
        service = SourceEmbeddingService(embedding_dim=128, index_path=os.path.join(temp_index_dir, "test_index"))
        
        # Add a source
        embedding = np.random.rand(128).astype('float32')
        service.add_source(sample_sources[0], embedding)
        
        # Check if same embedding is considered duplicate
        is_duplicate, duplicate_source = service.is_source_duplicate(sample_sources[1], embedding, threshold=0.0)
        
        # Assertions
        assert is_duplicate is True
        assert duplicate_source is not None
    
    def test_get_source_by_id(self, temp_index_dir, sample_sources):
        """Test retrieving a source by ID."""
        service = SourceEmbeddingService(embedding_dim=128, index_path=os.path.join(temp_index_dir, "test_index"))
        
        # Add a source
        embedding = np.random.rand(128).astype('float32')
        source_id = service.add_source(sample_sources[0], embedding)
        
        # Get source by ID
        source = service.get_source_by_id(source_id)
        
        # Assertions
        assert source is not None
        assert source["title"] == sample_sources[0]["title"]


class TestSourceAgent:
    """Tests for the SourceAgent class."""
    
    @pytest.mark.asyncio
    @patch('app.agents.search_sources')
    async def test_source_agent_process(self, mock_search_sources, sample_source_input, sample_sources):
        """Test the SourceAgent _process method."""
        # Setup mock
        mock_search_sources.return_value = {
            "sources": sample_sources
        }
        
        # Create agent and run process
        agent = SourceAgent()
        result = await agent._process(sample_source_input)
        
        # Assertions
        assert "sources" in result
        assert "source_summaries" in result
        assert len(result["sources"]) == len(sample_sources)
        assert len(result["source_summaries"]) == len(sample_sources)
        mock_search_sources.assert_called_once()


class TestPromptTemplates:
    """Tests for source-related prompt templates."""
    
    def test_source_retrieval_prompt_formatting(self, sample_source_input):
        """Test formatting of source retrieval prompts."""
        # Format the prompt
        formatted_prompt = format_prompt(
            PromptTemplates.SOURCE_RETRIEVAL_PROMPT,
            topic=sample_source_input["topic"],
            source_count=sample_source_input["source_count"],
            max_years=sample_source_input["max_years"]
        )
        
        # Assertions
        assert sample_source_input["topic"] in formatted_prompt
        assert str(sample_source_input["source_count"]) in formatted_prompt
        assert str(sample_source_input["max_years"]) in formatted_prompt
