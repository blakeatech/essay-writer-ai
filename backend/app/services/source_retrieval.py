"""
Source retrieval service with embedding-based memory to prevent duplicate citations.
Uses FAISS for efficient similarity search and storage of source embeddings.
"""

import os
import json
import numpy as np
import faiss
from typing import List, Dict, Any, Optional, Tuple
import hashlib
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SourceEmbeddingService:
    """
    Service for managing source embeddings using FAISS.
    Prevents duplicate or redundant citations across essays.
    """
    
    def __init__(self, embedding_dim: int = 1536, index_path: Optional[str] = None):
        """
        Initialize the source embedding service.
        
        Args:
            embedding_dim: Dimension of the embeddings (default: 1536 for OpenAI embeddings)
            index_path: Path to load existing FAISS index (if None, creates a new one)
        """
        self.embedding_dim = embedding_dim
        self.index = faiss.IndexFlatL2(embedding_dim)  # L2 distance for similarity
        self.source_metadata = {}  # Maps IDs to source metadata
        self.index_path = index_path or os.path.join(os.path.dirname(__file__), "source_index")
        
        # Load existing index if available
        self._load_index()
    
    def _load_index(self) -> None:
        """Load FAISS index and metadata from disk if available."""
        index_file = f"{self.index_path}.faiss"
        metadata_file = f"{self.index_path}.json"
        
        if os.path.exists(index_file) and os.path.exists(metadata_file):
            try:
                self.index = faiss.read_index(index_file)
                with open(metadata_file, 'r') as f:
                    self.source_metadata = json.load(f)
                logger.info(f"Loaded source index with {self.index.ntotal} sources")
            except Exception as e:
                logger.error(f"Error loading index: {e}")
                # Initialize a new index if loading fails
                self.index = faiss.IndexFlatL2(self.embedding_dim)
                self.source_metadata = {}
    
    def _save_index(self) -> None:
        """Save FAISS index and metadata to disk."""
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        
        try:
            faiss.write_index(self.index, f"{self.index_path}.faiss")
            with open(f"{self.index_path}.json", 'w') as f:
                json.dump(self.source_metadata, f)
            logger.info(f"Saved source index with {self.index.ntotal} sources")
        except Exception as e:
            logger.error(f"Error saving index: {e}")
    
    def add_source(self, source_data: Dict[str, Any], embedding: np.ndarray) -> str:
        """
        Add a source and its embedding to the index.
        
        Args:
            source_data: Dictionary containing source metadata
            embedding: Source embedding vector
            
        Returns:
            source_id: ID of the added source
        """
        # Ensure embedding is properly shaped
        embedding = np.array(embedding).astype('float32').reshape(1, self.embedding_dim)
        
        # Generate a unique ID for the source
        source_hash = hashlib.md5(str(source_data).encode()).hexdigest()
        source_id = f"{source_hash}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Add to FAISS index
        self.index.add(embedding)
        
        # Store metadata
        self.source_metadata[source_id] = {
            "data": source_data,
            "index": self.index.ntotal - 1,  # Index position in FAISS
            "added_at": datetime.now().isoformat()
        }
        
        # Save updated index
        self._save_index()
        
        return source_id
    
    def find_similar_sources(self, embedding: np.ndarray, k: int = 5, threshold: float = 0.75) -> List[Dict[str, Any]]:
        """
        Find similar sources to the given embedding.
        
        Args:
            embedding: Query embedding vector
            k: Number of similar sources to retrieve
            threshold: Similarity threshold (lower distance = more similar)
            
        Returns:
            List of similar source metadata
        """
        if self.index.ntotal == 0:
            return []
        
        # Ensure embedding is properly shaped
        embedding = np.array(embedding).astype('float32').reshape(1, self.embedding_dim)
        
        # Search for similar sources
        distances, indices = self.index.search(embedding, min(k, self.index.ntotal))
        
        # Filter by threshold and collect results
        similar_sources = []
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            # Convert distance to similarity score (1 - normalized distance)
            similarity = 1.0 - min(distance / 100.0, 1.0)  # Normalize and invert
            
            if similarity >= threshold:
                # Find source_id by index
                source_id = None
                for sid, metadata in self.source_metadata.items():
                    if metadata["index"] == idx:
                        source_id = sid
                        break
                
                if source_id:
                    similar_sources.append({
                        "source_id": source_id,
                        "similarity": similarity,
                        "data": self.source_metadata[source_id]["data"]
                    })
        
        return similar_sources
    
    def is_source_duplicate(self, source_data: Dict[str, Any], embedding: np.ndarray, threshold: float = 0.9) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Check if a source is a duplicate of an existing source.
        
        Args:
            source_data: Dictionary containing source metadata
            embedding: Source embedding vector
            threshold: Similarity threshold for considering a duplicate
            
        Returns:
            (is_duplicate, duplicate_source) tuple
        """
        similar_sources = self.find_similar_sources(embedding, k=1, threshold=threshold)
        
        if similar_sources:
            return True, similar_sources[0]
        
        return False, None
    
    def get_source_by_id(self, source_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a source by its ID.
        
        Args:
            source_id: ID of the source to retrieve
            
        Returns:
            Source metadata or None if not found
        """
        if source_id in self.source_metadata:
            return self.source_metadata[source_id]["data"]
        return None
    
    def remove_source(self, source_id: str) -> bool:
        """
        Remove a source from the index.
        Note: This doesn't actually remove from FAISS (which doesn't support removal),
        but marks it as removed in metadata.
        
        Args:
            source_id: ID of the source to remove
            
        Returns:
            Success flag
        """
        if source_id in self.source_metadata:
            self.source_metadata[source_id]["removed"] = True
            self._save_index()
            return True
        return False
    
    def clear_index(self) -> None:
        """Reset the index and metadata."""
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.source_metadata = {}
        self._save_index()


# Singleton instance
_source_embedding_service = None

def get_source_embedding_service() -> SourceEmbeddingService:
    """Get or create the singleton SourceEmbeddingService instance."""
    global _source_embedding_service
    if _source_embedding_service is None:
        _source_embedding_service = SourceEmbeddingService()
    return _source_embedding_service
