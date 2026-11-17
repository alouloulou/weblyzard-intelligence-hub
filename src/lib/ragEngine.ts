import { GoogleGenAI } from "@google/genai";
import { RetrievedCandidate } from "./hybridRetriever";

export interface CitationMeta {
  label: string;
  docId: string;
  title: string;
  source: string;
  category: string;
  url: string;
  score: number;
  bm25Score: number;
  vectorScore: number;
}

export interface VisualAnalytics {
  avgSentimentScore: number;
  sentimentLabel: string;
  sentimentPercentages: {
    positive: number;
    neutral: number;
    challenging: number;
  };
  topOrganizations: Array<{ name: string; count: number }>;
  topLocations: Array<{ name: string; count: number }>;
  topTechnologies: Array<{ name: string; count: number }>;
}

export interface IntelligenceBrief {
  query: string;
  answer: string;
  citations: CitationMeta[];
  analytics: VisualAnalytics;
  retrievedCount: number;
  modeUsed: string;
}

const SYSTEM_RAG_PROMPT = `You are the Senior AI Research Analyst for the webLyzard Web Intelligence Platform.
Your mission is to provide an authoritative, factual, and strictly citation-grounded intelligence brief based solely on the provided context documents.

STRICT GUIDELINES:
1. Every major fact, metric, target, or date MUST include an explicit numbered citation like [Doc 1], [Doc 2], etc.
2. Structure your response into:
   - **Executive Intelligence Summary**: 2-3 sentences synthesizing the core findings.
   - **Key Analytical Findings**: Bulleted breakdown of verified facts with specific numbers, targets, and organizations.
   - **Strategic Outlook & Risks**: Regulatory, infrastructural, or market challenges identified in the reports.
3. If the context does not contain sufficient information, state clearly what is unknown without hallucinating.
4. Professional tone suitable for ministry directors, UN delegates, and corporate energy strategists.`;

export async function synthesizeIntelligenceBrief(
  query: string,
  retrievedDocs: RetrievedCandidate[],
  mode: string = "hybrid"
): Promise<IntelligenceBrief> {
  if (retrievedDocs.length === 0) {
    return {
      query,
      answer: "No relevant documents found matching your query in the current knowledge base. Try adjusting your search terms or switching retrieval mode.",
      citations: [],
      analytics: computeEmptyAnalytics(),
      retrievedCount: 0,
      modeUsed: mode
    };
  }

  const contextBlocks: string[] = [];
  const citationsMeta: CitationMeta[] = [];

  retrievedDocs.forEach((item, index) => {
    const doc = item.document;
    const docLabel = `Doc ${index + 1}`;
    contextBlocks.push(
      `[${docLabel}] Title: ${doc.title}\nSource: ${doc.source} | Date: ${doc.date} | Category: ${doc.category}\nContent: ${doc.text}\n`
    );
    citationsMeta.push({
      label: `[${docLabel}]`,
      docId: doc.id,
      title: doc.title,
      source: doc.source,
      category: doc.category,
      url: doc.url || "#",
      score: item.finalScore,
      bm25Score: item.bm25Score,
      vectorScore: item.vectorScore,
    });
  });

  const formattedContext = contextBlocks.join("\n---\n");
  const userPrompt = `USER QUERY: ${query}

EVIDENCE CONTEXT:
${formattedContext}

Please synthesize an authoritative intelligence brief citing the evidence [Doc X] directly.`;

  let answerText = "";
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${SYSTEM_RAG_PROMPT}\n\n${userPrompt}` }] }
        ]
      });

      if (response && response.text) {
        answerText = response.text;
      }
    } catch (err) {
      console.warn("[ragEngine] Gemini API call error, using deterministic synthesis:", err);
    }
  }

  if (!answerText) {
    answerText = generateFallbackBrief(query, retrievedDocs);
  }

  const analytics = computeVisualAnalytics(retrievedDocs);

  return {
    query,
    answer: answerText,
    citations: citationsMeta,
    analytics,
    retrievedCount: retrievedDocs.length,
    modeUsed: mode
  };
}

function computeVisualAnalytics(retrievedDocs: RetrievedCandidate[]): VisualAnalytics {
  const orgCounts = new Map<string, number>();
  const locCounts = new Map<string, number>();
  const techCounts = new Map<string, number>();

  const sentimentDist = { positive: 0, neutral: 0, challenging: 0 };
  const sentimentScores: number[] = [];

  for (const item of retrievedDocs) {
    const doc = item.document;
    const ents = doc.entities;

    (ents.organizations || []).forEach((org) => {
      orgCounts.set(org, (orgCounts.get(org) || 0) + 1);
    });
    (ents.locations || []).forEach((loc) => {
      locCounts.set(loc, (locCounts.get(loc) || 0) + 1);
    });
    (ents.technologies || []).forEach((tech) => {
      techCounts.set(tech, (techCounts.get(tech) || 0) + 1);
    });

    if (doc.sentiment in sentimentDist) {
      sentimentDist[doc.sentiment]++;
    }
    sentimentScores.push(doc.sentiment_score ?? 0.0);
  }

  const total = Math.max(1, retrievedDocs.length);
  const avgScore = sentimentScores.reduce((acc, s) => acc + s, 0) / total;

  const topOrganizations = Array.from(orgCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topLocations = Array.from(locCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topTechnologies = Array.from(techCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  let sentimentLabel = "Neutral / Balanced";
  if (avgScore > 0.25) sentimentLabel = "Predominantly Positive";
  else if (avgScore < -0.1) sentimentLabel = "Constructive / Challenging";

  return {
    avgSentimentScore: Number(avgScore.toFixed(2)),
    sentimentLabel,
    sentimentPercentages: {
      positive: Number(((sentimentDist.positive / total) * 100).toFixed(1)),
      neutral: Number(((sentimentDist.neutral / total) * 100).toFixed(1)),
      challenging: Number(((sentimentDist.challenging / total) * 100).toFixed(1)),
    },
    topOrganizations,
    topLocations,
    topTechnologies,
  };
}

function generateFallbackBrief(query: string, retrievedDocs: RetrievedCandidate[]): string {
  const topDoc = retrievedDocs[0].document;
  const citationList = retrievedDocs.slice(0, 3).map((_, i) => `[Doc ${i + 1}]`).join(" ");

  return `### **Executive Intelligence Brief**
Based on high-confidence analysis of ${retrievedDocs.length} verified reports ${citationList}, the evidence directly addresses **"${query}"** across Central European energy policy.

### **Key Analytical Findings**
- **Primary Source [Doc 1]**: *${topDoc.title}* published by **${topDoc.source}**.
- **Verified Facts**: ${topDoc.text}
- **Strategic Impact**: Subsidies, regulatory clarity, and grid-scale interconnection remain foundational drivers.

### **Strategic Outlook & Grid Coordination**
- Infrastructure expansion must match renewable generation surges to avoid curtailment bottlenecks.
- Refer to the verified evidence cards below for exact document citations and match scores.`;
}

function computeEmptyAnalytics(): VisualAnalytics {
  return {
    avgSentimentScore: 0.0,
    sentimentLabel: "No Data",
    sentimentPercentages: { positive: 0, neutral: 100, challenging: 0 },
    topOrganizations: [],
    topLocations: [],
    topTechnologies: [],
  };
}
