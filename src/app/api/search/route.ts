import { NextRequest, NextResponse } from "next/server";
import { getRetrieverInstance } from "@/lib/hybridRetriever";

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
    const results = retriever.search(query, mode, topK);

    return NextResponse.json({
      query,
      mode,
      totalResults: results.length,
      results,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal search error" }, { status: 500 });
  }
}
