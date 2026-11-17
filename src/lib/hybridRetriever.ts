import { KnowledgeDocument, INITIAL_DOCUMENTS } from "./dataset";
import { BM25Engine } from "./bm25";
import { VectorSearchEngine } from "./vectorSearch";

export interface RetrievedCandidate {
  document: KnowledgeDocument;
  docIndex: number;
  finalScore: number;
  bm25Score: number;
  vectorScore: number;
  bm25Rank: number | null;
  vectorRank: number | null;
  mode: string;
}

export class HybridRetriever {
  private corpus: KnowledgeDocument[] = [];
  private bm25: BM25Engine;
  private vectorEngine: VectorSearchEngine;
  private isInitialized: boolean = false;

  constructor() {
    this.bm25 = new BM25Engine();
    this.vectorEngine = new VectorSearchEngine();
  }

  public async initialize(initialCorpus: KnowledgeDocument[] = INITIAL_DOCUMENTS) {
    this.corpus = [...initialCorpus];
    this.bm25.fit(this.corpus);
    await this.vectorEngine.fit(this.corpus);
    this.isInitialized = true;
  }

  public getCorpus(): KnowledgeDocument[] {
    return this.corpus;
  }

  public async addDocument(doc: KnowledgeDocument) {
    this.corpus.unshift(doc);
    this.bm25.fit(this.corpus);
    await this.vectorEngine.fit(this.corpus);
  }

  public async search(
    query: string,
    mode: "hybrid" | "vector_only" | "bm25_only" = "hybrid",
    topK: number = 4,
    bm25Weight: number = 0.5,
    vectorWeight: number = 0.5
  ): Promise<RetrievedCandidate[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!query.trim() || this.corpus.length === 0) return [];

    const candidateCount = Math.min(this.corpus.length, Math.max(topK * 2, 8));
    const bm25Results = this.bm25.search(query, candidateCount);
    const vectorResults = await this.vectorEngine.search(query, candidateCount);

    const bm25Ranks = new Map<number, number>();
    const bm25RawScores = new Map<number, number>();
    let maxBm25 = 1.0;

    bm25Results.forEach((item, rank) => {
      bm25Ranks.set(item.docIndex, rank + 1);
      bm25RawScores.set(item.docIndex, item.score);
      if (item.score > maxBm25) maxBm25 = item.score;
    });

    const vectorRanks = new Map<number, number>();
    const vectorRawScores = new Map<number, number>();

    vectorResults.forEach((item, rank) => {
      vectorRanks.set(item.docIndex, rank + 1);
      vectorRawScores.set(item.docIndex, item.score);
    });

    const candidateIndices = new Set([...bm25Ranks.keys(), ...vectorRanks.keys()]);
    const fused: RetrievedCandidate[] = [];
    const rrfConstant = 60.0;

    for (const docIdx of candidateIndices) {
      const doc = this.corpus[docIdx];
      const rankB = bm25Ranks.get(docIdx) ?? 100;
      const rankV = vectorRanks.get(docIdx) ?? 100;

      const rawB = bm25RawScores.get(docIdx) ?? 0.0;
      const normB = maxBm25 > 0 ? rawB / maxBm25 : 0.0;
      const scoreV = vectorRawScores.get(docIdx) ?? 0.0;

      const rrfScore = (bm25Weight / (rrfConstant + rankB)) + (vectorWeight / (rrfConstant + rankV));
      const blendedScore = (bm25Weight * normB) + (vectorWeight * scoreV);

      let finalScore = 0.0;
      let isSelected = false;

      if (mode === "bm25_only") {
        finalScore = normB;
        isSelected = bm25Ranks.has(docIdx);
      } else if (mode === "vector_only") {
        finalScore = scoreV;
        isSelected = vectorRanks.has(docIdx);
      } else {
        finalScore = (rrfScore * 30.0) + (blendedScore * 0.5);
        isSelected = true;
      }

      if (isSelected && finalScore > 0.01) {
        fused.push({
          document: doc,
          docIndex: docIdx,
          finalScore: Number(finalScore.toFixed(4)),
          bm25Score: Number(normB.toFixed(4)),
          vectorScore: Number(scoreV.toFixed(4)),
          bm25Rank: rankB <= candidateCount ? rankB : null,
          vectorRank: rankV <= candidateCount ? rankV : null,
          mode
        });
      }
    }

    fused.sort((a, b) => b.finalScore - a.finalScore);
    return fused.slice(0, topK);
  }
}

// Global Singleton for in-memory persistence in Next.js Serverless runtime
declare global {
  // eslint-disable-next-line no-var
  var __globalHybridRetriever: HybridRetriever | undefined;
}

export function getRetrieverInstance(): HybridRetriever {
  if (!global.__globalHybridRetriever) {
    global.__globalHybridRetriever = new HybridRetriever();
  }
  return global.__globalHybridRetriever;
}
