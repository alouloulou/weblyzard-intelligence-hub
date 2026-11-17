import { NextResponse } from "next/server";
import { getRetrieverInstance } from "@/lib/hybridRetriever";

export async function GET() {
  const retriever = getRetrieverInstance();
  const corpus = retriever.getCorpus();

  return NextResponse.json({
    status: "online",
    service: "webLyzard Web Intelligence Platform",
    domain: "Global Clean Energy & Climate Policy Intelligence",
    activeDocuments: corpus.length,
    retrievalModes: ["hybrid", "vector_only", "bm25_only"],
    engineType: "Neuro-Symbolic Hybrid (Okapi BM25 + Gemini Dense Vector Embeddings + RRF)",
  });
}
