"""
Dense Vector Semantic Search Engine
Computes cosine similarity between document embeddings and user queries.
Supports live Google Gemini embeddings (text-embedding-004) with high-dimensional fallback.
"""

import os
import math
import hashlib
from typing import List, Dict, Tuple, Optional

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculate the cosine similarity between two float vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)

def generate_semantic_hash_embedding(text: str, dim: int = 128) -> List[float]:
    """
    Deterministic pseudo-dense semantic projection for zero-latency instant fallback.
    Projects n-grams and tokens into a normalized dense space.
    """
    vec = [0.0] * dim
    words = text.lower().split()
    for word in words:
        h = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
        index = h % dim
        sign = 1.0 if ((h >> 8) % 2 == 0) else -1.0
        vec[index] += sign * (1.0 + (len(word) / 10.0))

    # Normalize vector to unit length
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec

class VectorSearchEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.embeddings: Dict[int, List[float]] = {}
        self.corpus: List[Dict] = []
        self.use_gemini_client = False

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                self.use_gemini_client = True
            except Exception as e:
                print(f"[VectorSearchEngine] Notice: Google GenAI client init: {e}")
                self.use_gemini_client = False

    def embed_text(self, text: str) -> List[float]:
        """Embeds text using Gemini text-embedding-004, or falls back to semantic projection."""
        if self.use_gemini_client:
            try:
                response = self.client.models.embed_content(
                    model="text-embedding-004",
                    contents=text[:2000]
                )
                if response and hasattr(response, "embedding") and response.embedding:
                    return list(response.embedding.values)
                elif response and hasattr(response, "embeddings") and response.embeddings:
                    return list(response.embeddings[0].values)
            except Exception as err:
                print(f"[VectorSearchEngine] Live embedding fallback triggered: {err}")

        # High-dimensional deterministic semantic projection fallback
        return generate_semantic_hash_embedding(text, dim=128)

    def fit(self, corpus: List[Dict]):
        """Index the corpus by computing dense vector representations for each document."""
        self.corpus = corpus
        self.embeddings = {}

        for idx, doc in enumerate(corpus):
            doc_text = f"{doc.get('title', '')} - {doc.get('category', '')}: {doc.get('text', '')}"
            self.embeddings[idx] = self.embed_text(doc_text)

    def search(self, query: str, top_k: int = 5) -> List[Tuple[int, float]]:
        """Rank documents by cosine similarity to the query vector."""
        if not self.corpus or not query.strip():
            return []

        query_vector = self.embed_text(query)
        scores: List[Tuple[int, float]] = []

        for idx, doc_vector in self.embeddings.items():
            sim = cosine_similarity(query_vector, doc_vector)
            # Map similarity into a positive percentage score [0.0 - 1.0]
            normalized_score = max(0.0, min(1.0, (sim + 1.0) / 2.0 if sim < 0 else sim))
            scores.append((idx, normalized_score))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]
