"""
BM25 (Best Matching 25) Symbolic / Lexical Search Implementation
Pure Python implementation following the Okapi BM25 Robertson-Spärck Jones formulation.
"""

import math
import re
from typing import List, Dict, Tuple, Set

# Standard English & German common stopwords for clean tokenization
STOPWORDS: Set[str] = {
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which",
    "this", "that", "these", "those", "then", "just", "so", "than", "such", "both",
    "through", "about", "for", "is", "of", "while", "during", "to", "from", "in",
    "out", "on", "off", "again", "further", "then", "once", "here", "there", "when",
    "where", "why", "how", "all", "any", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
    "too", "very", "can", "will", "just", "don", "should", "now", "der", "die", "das",
    "und", "in", "den", "von", "zu", "mit", "ist", "des", "nicht", "eine", "fuer", "auf"
}

def tokenize(text: str) -> List[str]:
    """Tokenize and normalize text into clean lowercase words without punctuation."""
    words = re.findall(r"\b[a-zA-Z0-9_\-äöüÄÖÜß]{2,}\b", text.lower())
    return [w for w in words if w not in STOPWORDS]

class BM25Retriever:
    """
    Okapi BM25 Lexical Inverted Index
    Parameters:
        k1 (float): Term frequency saturation parameter (default: 1.5)
        b (float): Document length normalization parameter (default: 0.75)
    """
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_count: int = 0
        self.avg_doc_len: float = 0.0
        self.doc_lens: List[int] = []
        self.corpus: List[Dict] = []
        self.inverted_index: Dict[str, Dict[int, int]] = {}  # term -> {doc_idx: freq}
        self.idf: Dict[str, float] = {}

    def fit(self, corpus: List[Dict]):
        """Build the inverted index and compute IDF statistics across all documents."""
        self.corpus = corpus
        self.doc_count = len(corpus)
        if self.doc_count == 0:
            return

        self.doc_lens = []
        self.inverted_index = {}
        total_len = 0

        for idx, doc in enumerate(corpus):
            # Combine title, text, category, and entities for lexical indexing
            text_to_index = f"{doc.get('title', '')} {doc.get('text', '')} {doc.get('category', '')}"
            tokens = tokenize(text_to_index)
            doc_len = len(tokens)
            self.doc_lens.append(doc_len)
            total_len += doc_len

            # Calculate token frequencies in this document
            token_counts: Dict[str, int] = {}
            for token in tokens:
                token_counts[token] = token_counts.get(token, 0) + 1

            for token, count in token_counts.items():
                if token not in self.inverted_index:
                    self.inverted_index[token] = {}
                self.inverted_index[token][idx] = count

        self.avg_doc_len = total_len / self.doc_count if self.doc_count > 0 else 1.0

        # Compute IDF for every term in the vocabulary
        self.idf = {}
        for term, postings in self.inverted_index.items():
            doc_freq = len(postings)
            # Standard Robertson-Spärck Jones IDF with floor protection
            idf_score = math.log(1.0 + (self.doc_count - doc_freq + 0.5) / (doc_freq + 0.5))
            self.idf[term] = max(0.05, idf_score)

    def search(self, query: str, top_k: int = 5) -> List[Tuple[int, float]]:
        """
        Rank documents by BM25 relevance score for the query string.
        Returns a list of (doc_index, bm25_score) tuples sorted in descending order.
        """
        query_tokens = tokenize(query)
        if not query_tokens or self.doc_count == 0:
            return []

        scores: Dict[int, float] = {}

        for token in query_tokens:
            if token not in self.inverted_index:
                continue

            token_idf = self.idf[token]
            postings = self.inverted_index[token]

            for doc_idx, freq in postings.items():
                doc_len = self.doc_lens[doc_idx]
                numerator = freq * (self.k1 + 1.0)
                denominator = freq + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
                term_score = token_idf * (numerator / denominator)

                scores[doc_idx] = scores.get(doc_idx, 0.0) + term_score

        sorted_results = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        return sorted_results[:top_k]
