# webLyzard Intelligence Hub: Semantic Search & Hybrid RAG Platform

> **A Neuro-Symbolic Web Intelligence & Citation-Grounded RAG Platform** modeled after webLyzard technology's visual analytics architecture for environmental, climate, and energy policy intelligence.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Python 3.13](https://img.shields.io/badge/Python-3.13-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini 2.5](https://img.shields.io/badge/Google%20GenAI-Gemini%202.5%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![BM25](https://img.shields.io/badge/Algorithm-Okapi%20BM25-orange?style=flat)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🏛️ Executive Overview

Inspired by **webLyzard technology's** flagship Web Intelligence Platform (developed for international organizations including UNEP, NOAA, and EU Horizon Europe initiatives), this platform demonstrates an enterprise-grade **Hybrid Information Retrieval (Neuro-Symbolic)** engine paired with citation-grounded generative synthesis.

The system indexes official policy whitepapers, regulatory acts, and corporate sustainability disclosures centered on **Austrian & Central European Clean Energy Transition** (electrolysis targets, deep geothermal district heating, high-voltage grid reinforcement, industrial steel decarbonization, and battery storage).

---

## ⚡ Core Architecture

```
                                  ┌───────────────────────────────┐
                                  │      User Search Query        │
                                  └───────────────┬───────────────┘
                                                  │
                         ┌────────────────────────┴────────────────────────┐
                         ▼                                                 ▼
        ┌───────────────────────────────────┐    ┌───────────────────────────────────┐
        │       Symbolic Lexical Index      │    │        Dense Semantic Space       │
        │             Okapi BM25            │    │    Gemini text-embedding-004      │
        │   Term Frequencies + Spärck Jones │    │       Cosine Similarity Math      │
        └─────────────────┬─────────────────┘    └─────────────────┬─────────────────┘
                          │                                        │
                          └───────────────────────┬────────────────┘
                                                  ▼
                                 ┌───────────────────────────────────┐
                                 │   Reciprocal Rank Fusion (RRF)    │
                                 │       RRF_Score = Σ 1/(k + rank)  │
                                 └────────────────┬──────────────────┘
                                                  ▼
                                 ┌───────────────────────────────────┐
                                 │     Top-k Evidence Extraction     │
                                 │   Context Chunks + Explicit Citations
                                 └────────────────┬──────────────────┘
                                                  ▼
                                 ┌───────────────────────────────────┐
                                 │   Google Gemini 2.5 Flash RAG     │
                                 │ Grounded Synthesis & Citations [1]│
                                 └────────────────┬──────────────────┘
                                                  ▼
             ┌────────────────────────────────────┴────────────────────────────────────┐
             ▼                                                                         ▼
┌─────────────────────────────┐                                           ┌─────────────────────────────┐
│  Grounded Executive Brief   │                                           │  webLyzard Visual Analytics │
│  - Bulleted Evidence Points │                                           │  - Sentiment Polarity Meter │
│  - Regulatory Outlook       │                                           │  - Entity Co-occurrence Tag │
│  - Strict [Doc X] Anchors   │                                           │  - Technology Clusters      │
└─────────────────────────────┘                                           └─────────────────────────────┘
```

---

## 🚀 Key Features

1. **Hybrid Retrieval (Neuro-Symbolic IR):**
   - **Symbolic:** Exact keyword matching via Okapi BM25 with document length normalization ($k_1 = 1.5, b = 0.75$).
   - **Dense Neural:** Vector embeddings capturing conceptual intent and semantic proximity via cosine similarity.
   - **Reciprocal Rank Fusion (RRF):** Blends ranked lists to maximize precision without manual hyperparameter tuning.

2. **webLyzard Visual Web Intelligence:**
   - **Media Sentiment & Polarity Meter:** Real-time distribution of tone (Positive, Neutral, Challenging) across retrieved reports.
   - **Entity Co-occurrence Matrix:** Automated extraction and clustering of Key Stakeholders (*VERBUND, BMK, voestalpine, Wien Energie, APG*), Locations (*Vienna, Linz, Salzburg, Danube Corridor*), and Technology Clusters (*Electrolysis, Deep Geothermal, 380kV Ring*).
   - **1-Click Entity Pivoting:** Clicking any extracted stakeholder automatically re-indexes and focuses the intelligence brief on that organization.

3. **Strict Citation-Grounded Synthesis:**
   - Hallucination-free answers anchored directly to retrieved evidence with explicit `[Doc 1]`, `[Doc 2]` tags.
   - Evidence inspector revealing exact match scores, BM25 component scores, and publisher metadata.

4. **Interactive Document Ingestion:**
   - Recruiter/user interface allowing dynamic pasting or uploading of custom reports.
   - Real-time tokenization, entity tagging, vectorization, and live index updating.

---

## 📂 Repository Structure

```
webLyzard_MVP/
├── python_engine/                  # Pure Python Backend & CLI
│   ├── dataset.py                  # Domain corpus: 12 Austrian clean energy reports
│   ├── bm25.py                     # Pure Python Okapi BM25 implementation
│   ├── vector_search.py            # Cosine similarity & Gemini embedding engine
│   ├── hybrid_retriever.py         # Reciprocal Rank Fusion & score normalization
│   ├── rag_engine.py               # Gemini RAG generation & visual analytics
│   └── main.py                     # FastAPI REST API endpoints
│
├── src/                            # Next.js 16 Full-Stack Production Frontend
│   ├── app/
│   │   ├── api/
│   │   │   ├── search/route.ts     # Hybrid search endpoint
│   │   │   ├── chat/route.ts       # Grounded RAG synthesis endpoint
│   │   │   ├── ingest/route.ts     # Custom document vectorization endpoint
│   │   │   └── status/route.ts     # Live engine health & corpus stats
│   │   ├── globals.css             # webLyzard deep oceanic color tokens
│   │   ├── layout.tsx              # Root layout & meta tags
│   │   └── page.tsx                # Master Visual Intelligence Dashboard
│   └── lib/
│       ├── dataset.ts              # Knowledge base interface & corpus
│       ├── bm25.ts                 # TypeScript Okapi BM25 engine
│       ├── vectorSearch.ts         # TypeScript vector cosine search
│       ├── hybridRetriever.ts      # TypeScript RRF fusion & singleton
│       └── ragEngine.ts            # Grounded RAG synthesis & entity analytics
│
├── requirements.txt                # Python dependencies (FastAPI, uvicorn, etc.)
├── package.json                    # Node dependencies (Next.js 16, React 19, Tailwind)
└── README.md
```

---

## 🛠️ Quick Start

### Option A: Next.js Full-Stack (Zero-Config Vercel Ready)

```bash
# 1. Clone repository
git clone https://github.com/<your-username>/weblyzard-intelligence-hub.git
cd weblyzard-intelligence-hub

# 2. Install dependencies
npm install

# 3. Configure environment variable
# Create a .env.local file:
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

### Option B: Dedicated Python FastAPI Engine

```bash
# 1. Install Python requirements
pip install -r requirements.txt

# 2. Set environment variable
export GEMINI_API_KEY="your_gemini_api_key_here"

# 3. Launch FastAPI server
python -m uvicorn python_engine.main:app --reload --port 8000
```

FastAPI interactive Swagger UI will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 🌐 Deploy to Vercel (100% Free Plan)

1. Push this repository to your GitHub account.
2. Go to [Vercel Dashboard](https://vercel.com) $\rightarrow$ **Add New Project** $\rightarrow$ **Import**.
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY` = *(Your Google Gemini API Key)*
4. Click **Deploy**. The app builds and deploys in ~40 seconds with zero server fees.

---

## 👨‍💻 Author

**Ali Ayadi**  
*Computer Science Graduate, Johannes Kepler Universität Linz (JKU)*  
Focus: Applied Generative AI, Hybrid Search Architectures & Intelligent Autonomous Systems
