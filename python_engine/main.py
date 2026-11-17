"""
webLyzard Web Intelligence Hub - FastAPI Server
Exposes Semantic Search, Hybrid BM25/Vector Retrieval, and Grounded RAG APIs.
"""

import os
import copy
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .dataset import DEFAULT_DOCUMENTS
from .hybrid_retriever import HybridRetriever
from .rag_engine import RAGEngine

app = FastAPI(
    title="webLyzard Web Intelligence & Hybrid RAG Engine",
    description="Neuro-Symbolic Information Retrieval combining Okapi BM25 with Dense Gemini Embeddings",
    version="1.0.0"
)

# Enable CORS for local Next.js development and remote Vercel clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory document storage initialized from default climate & clean energy corpus
CORPUS = copy.deepcopy(DEFAULT_DOCUMENTS)
API_KEY = os.environ.get("GEMINI_API_KEY", "")

retriever = HybridRetriever(CORPUS, api_key=API_KEY)
rag_engine = RAGEngine(api_key=API_KEY)

# Pydantic Request Models
class SearchRequest(BaseModel):
    query: str
    mode: str = "hybrid"  # "hybrid" | "vector_only" | "bm25_only"
    top_k: int = 4
    bm25_weight: float = 0.5
    vector_weight: float = 0.5

class ChatRequest(BaseModel):
    query: str
    mode: str = "hybrid"
    top_k: int = 4

class IngestDocumentRequest(BaseModel):
    title: str
    source: str
    category: str
    text: str
    url: Optional[str] = "https://weblyzard-hub.local"
    organizations: Optional[List[str]] = []
    locations: Optional[List[str]] = []
    technologies: Optional[List[str]] = []
    sentiment: Optional[str] = "neutral"

@app.get("/api/status")
def get_status():
    """System status and active index metrics."""
    return {
        "status": "online",
        "service": "webLyzard Web Intelligence Platform",
        "active_documents": len(CORPUS),
        "retrieval_modes": ["hybrid", "vector_only", "bm25_only"],
        "bm25_terms_indexed": len(retriever.bm25.inverted_index),
        "vector_dimensions": 128 if not retriever.vector_engine.use_gemini_client else 768,
        "engine_type": "Neuro-Symbolic (BM25 + Dense Cosine Similarity + Reciprocal Rank Fusion)"
    }

@app.get("/api/documents")
def get_documents():
    """Returns the catalog of all indexed documents and metadata."""
    return {
        "count": len(CORPUS),
        "documents": CORPUS
    }

@app.post("/api/search")
def search_documents(req: SearchRequest):
    """Executes hybrid, dense semantic, or exact lexical search."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    results = retriever.search(
        query=req.query,
        mode=req.mode,
        top_k=req.top_k,
        bm25_weight=req.bm25_weight,
        vector_weight=req.vector_weight
    )

    return {
        "query": req.query,
        "mode": req.mode,
        "total_results": len(results),
        "results": results
    }

@app.post("/api/chat")
def synthesize_intelligence_brief(req: ChatRequest):
    """Executes retrieval followed by citation-grounded RAG synthesis and visual analytics."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # 1. Retrieve top-k evidence chunks
    retrieved = retriever.search(query=req.query, mode=req.mode, top_k=req.top_k)

    # 2. Synthesize with Gemini RAG
    brief = rag_engine.synthesize(query=req.query, retrieved_docs=retrieved)
    brief["mode_used"] = req.mode

    return brief

@app.post("/api/ingest")
def ingest_new_document(req: IngestDocumentRequest):
    """Ingests a new policy report or news article into the live search index."""
    if not req.title.strip() or not req.text.strip():
        raise HTTPException(status_code=400, detail="Title and text content are required.")

    new_id = f"custom_doc_{len(CORPUS) + 1:02d}"
    new_doc = {
        "id": new_id,
        "title": req.title.strip(),
        "source": req.source.strip() or "Custom Upload / Ingested Document",
        "date": "2026-03-01",
        "url": req.url or "#",
        "category": req.category.strip() or "General Clean Energy",
        "text": req.text.strip(),
        "entities": {
            "organizations": req.organizations or ["Custom Entity"],
            "locations": req.locations or ["Central Europe"],
            "technologies": req.technologies or ["Clean Tech"]
        },
        "sentiment": req.sentiment,
        "sentiment_score": 0.5 if req.sentiment == "positive" else (-0.3 if req.sentiment == "challenging" else 0.0)
    }

    CORPUS.insert(0, new_doc)
    retriever.fit(CORPUS)

    return {
        "success": True,
        "message": f"Document '{req.title}' successfully indexed into BM25 and Vector indices.",
        "assigned_id": new_id,
        "total_documents": len(CORPUS)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("python_engine.main:app", host="127.0.0.1", port=8000, reload=True)
