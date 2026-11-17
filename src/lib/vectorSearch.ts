import { GoogleGenAI } from "@google/genai";
import { KnowledgeDocument } from "./dataset";

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0.0;

  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0.0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Deterministic semantic hash projection for ultra-fast, zero-latency vector embedding
export function generateSemanticHashEmbedding(text: string, dim: number = 128): number[] {
  const vec = new Array(dim).fill(0.0);
  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const index = absHash % dim;
    const sign = (absHash >> 3) % 2 === 0 ? 1.0 : -1.0;
    vec[index] += sign * (1.0 + word.length / 8.0);
  }

  let sumSq = 0.0;
  for (let i = 0; i < dim; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
}

export class VectorSearchEngine {
  private corpus: KnowledgeDocument[] = [];
  private embeddings: Map<number, number[]> = new Map();

  constructor() {}

  public embedText(text: string): number[] {
    return generateSemanticHashEmbedding(text, 128);
  }

  public fit(corpus: KnowledgeDocument[]) {
    this.corpus = corpus;
    this.embeddings.clear();

    for (let i = 0; i < corpus.length; i++) {
      const doc = corpus[i];
      const textToEmbed = `${doc.title} ${doc.category}: ${doc.text}`;
      const embedding = this.embedText(textToEmbed);
      this.embeddings.set(i, embedding);
    }
  }

  public search(query: string, topK: number = 5): Array<{ docIndex: number; score: number }> {
    if (this.corpus.length === 0 || !query.trim()) return [];

    const queryVec = this.embedText(query);
    const results: Array<{ docIndex: number; score: number }> = [];

    for (const [docIdx, docVec] of this.embeddings.entries()) {
      const sim = cosineSimilarity(queryVec, docVec);
      const normalizedScore = Math.max(0.0, Math.min(1.0, sim < 0 ? (sim + 1.0) / 2.0 : sim));
      results.push({ docIndex: docIdx, score: normalizedScore });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}
