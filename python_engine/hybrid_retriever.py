"""
Hybrid Retriever (Neuro-Symbolic Information Retrieval)
Combines BM25 (Symbolic Lexical Matching) with Dense Vector Search (Neural Semantic Cosine Similarity)
using Reciprocal Rank Fusion (RRF) and Score Normalization.
"""

from typing import List, Dict, Any, Optional
from .bm25 import BM25Retriever
from .vector_search import VectorSearchEngine

class HybridRetriever:
    def __init__(self, corpus: List[Dict], api_key: Optional[str] = None):
        self.corpus = corpus
        self.bm25 = BM25Retriever()
        self.vector_engine = VectorSearchEngine(api_key=api_key)
        self.fit(corpus)

    def fit(self, corpus: List[Dict]):
        """Index the corpus across both symbolic and dense vector modalities."""
        self.corpus = corpus
        self.bm25.fit(corpus)
        self.vector_engine.fit(corpus)

    def search(
        self,
        query: str,
        mode: str = "hybrid",
        top_k: int = 5,
        bm25_weight: float = 0.5,
        vector_weight: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Executes search using the requested mode:
        - 'hybrid': Reciprocal Rank Fusion (RRF) + Normalized Score Blending
        - 'vector_only': Dense Semantic Search (Cosine Similarity)
        - 'bm25_only': Exact Symbolic Lexical Search (Okapi BM25)
        """
        if not query.strip() or not self.corpus:
            return []

        # 1. Retrieve candidates from both indices
        candidate_count = min(len(self.corpus), max(top_k * 2, 8))
        bm25_results = self.bm25.search(query, top_k=candidate_count)
        vector_results = self.vector_engine.search(query, top_k=candidate_count)

        bm25_ranks = {doc_idx: rank + 1 for rank, (doc_idx, _) in enumerate(bm25_results)}
        vector_ranks = {doc_idx: rank + 1 for rank, (doc_idx, _) in enumerate(vector_results)}

        bm25_raw_scores = dict(bm25_results)
        vector_raw_scores = dict(vector_results)

        # Normalize BM25 raw scores to [0.0, 1.0]
        max_bm25 = max(bm25_raw_scores.values()) if bm25_raw_scores else 1.0
        normalized_bm25 = {
            doc_idx: (score / max_bm25) if max_bm25 > 0 else 0.0
            for doc_idx, score in bm25_raw_scores.items()
        }

        all_candidate_indices = set(bm25_ranks.keys()).union(set(vector_ranks.keys()))
        fused_candidates: List[Dict[str, Any]] = []

        rrf_constant = 60.0  # Standard Cormack RRF smoothing parameter

        for doc_idx in all_candidate_indices:
            doc = self.corpus[doc_idx]

            rank_b = bm25_ranks.get(doc_idx, 100)
            rank_v = vector_ranks.get(doc_idx, 100)

            score_b = normalized_bm25.get(doc_idx, 0.0)
            score_v = vector_raw_scores.get(doc_idx, 0.0)

            # Reciprocal Rank Fusion Score
            rrf_score = (bm25_weight / (rrf_constant + rank_b)) + (vector_weight / (rrf_constant + rank_v))
            blended_score = (bm25_weight * score_b) + (vector_weight * score_v)

            if mode == "bm25_only":
                final_score = score_b
                is_selected = doc_idx in bm25_ranks
            elif mode == "vector_only":
                final_score = score_v
                is_selected = doc_idx in vector_ranks
            else:  # hybrid
                final_score = (rrf_score * 30.0) + (blended_score * 0.5)
                is_selected = True

            if is_selected and final_score > 0.01:
                fused_candidates.append({
                    "document": doc,
                    "doc_index": doc_idx,
                    "final_score": round(float(final_score), 4),
                    "bm25_score": round(float(score_b), 4),
                    "vector_score": round(float(score_v), 4),
                    "bm25_rank": rank_b if rank_b <= candidate_count else None,
                    "vector_rank": rank_v if rank_v <= candidate_count else None,
                    "mode": mode
                })

        # Sort descending by the computed score
        fused_candidates.sort(key=lambda x: x["final_score"], reverse=True)
        return fused_candidates[:top_k]
