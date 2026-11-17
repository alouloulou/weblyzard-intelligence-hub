import { NextRequest, NextResponse } from "next/server";
import { getRetrieverInstance } from "@/lib/hybridRetriever";
import { KnowledgeDocument } from "@/lib/dataset";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = (body.title || "").trim();
    const text = (body.text || "").trim();
    const source = (body.source || "User Ingested Report").trim();
    const category = (body.category || "General Clean Energy").trim();
    const sentiment = body.sentiment || "neutral";

    if (!title || !text) {
      return NextResponse.json({ error: "Title and text content are required" }, { status: 400 });
    }

    const retriever = getRetrieverInstance();
    const existing = retriever.getCorpus();

    const newDoc: KnowledgeDocument = {
      id: `custom_doc_${existing.length + 1}`,
      title,
      source,
      date: new Date().toISOString().split("T")[0],
      url: body.url || "#",
      category,
      text,
      entities: {
        organizations: body.organizations || ["Custom Organization"],
        locations: body.locations || ["Austria", "Central Europe"],
        technologies: body.technologies || ["Clean Tech"],
      },
      sentiment: sentiment,
      sentiment_score: sentiment === "positive" ? 0.6 : sentiment === "challenging" ? -0.3 : 0.0,
    };

    retriever.addDocument(newDoc);

    return NextResponse.json({
      success: true,
      message: `Document "${title}" successfully indexed into BM25 and Vector indices.`,
      docId: newDoc.id,
      totalDocuments: retriever.getCorpus().length,
    });
  } catch (error) {
    console.error("Ingest API error:", error);
    return NextResponse.json({ error: "Document ingestion error" }, { status: 500 });
  }
}
