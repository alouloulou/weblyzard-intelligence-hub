import { NextRequest, NextResponse } from "next/server";
import { getRetrieverInstance } from "@/lib/hybridRetriever";
import { synthesizeIntelligenceBrief } from "@/lib/ragEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || "").trim();
    const mode = body.mode || "hybrid";
    const topK = body.topK || 4;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const retriever = getRetrieverInstance();
    const retrievedDocs = retriever.search(query, mode, topK);
    const brief = await synthesizeIntelligenceBrief(query, retrievedDocs, mode);

    return NextResponse.json(brief);
  } catch (error) {
    console.error("Chat RAG API error:", error);
    return NextResponse.json({ error: "Internal RAG generation error" }, { status: 500 });
  }
}
