import { KnowledgeDocument } from "./dataset";

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which",
  "this", "that", "these", "those", "then", "just", "so", "than", "such", "both",
  "through", "about", "for", "is", "of", "while", "during", "to", "from", "in",
  "out", "on", "off", "again", "further", "then", "once", "here", "there", "when",
  "where", "why", "how", "all", "any", "each", "few", "more", "most", "other",
  "some", "no", "nor", "not", "only", "own", "same", "too", "very", "can", "will",
  "should", "now", "der", "die", "das", "und", "in", "den", "von", "zu", "mit",
  "ist", "des", "nicht", "eine", "fuer", "auf"
]);

export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-zA-Z0-9_\-äöüÄÖÜß]{2,}\b/g) || [];
  return words.filter((w) => !STOPWORDS.has(w));
}

export class BM25Engine {
  private k1: number;
  private b: number;
  private docCount: number = 0;
  private avgDocLen: number = 0;
  private docLens: number[] = [];
  private invertedIndex: Map<string, Map<number, number>> = new Map();
  private idf: Map<string, number> = new Map();
  private corpus: KnowledgeDocument[] = [];

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  public fit(corpus: KnowledgeDocument[]) {
    this.corpus = corpus;
    this.docCount = corpus.length;
    if (this.docCount === 0) return;

    this.docLens = [];
    this.invertedIndex.clear();
    let totalLen = 0;

    for (let idx = 0; idx < corpus.length; idx++) {
      const doc = corpus[idx];
      const textToIndex = `${doc.title} ${doc.text} ${doc.category} ${(doc.entities.technologies || []).join(" ")} ${(doc.entities.organizations || []).join(" ")}`;
      const tokens = tokenize(textToIndex);
      const len = tokens.length;
      this.docLens.push(len);
      totalLen += len;

      const tokenCounts = new Map<string, number>();
      for (const t of tokens) {
        tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
      }

      for (const [token, count] of tokenCounts.entries()) {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, new Map());
        }
        this.invertedIndex.get(token)!.set(idx, count);
      }
    }

    this.avgDocLen = this.docCount > 0 ? totalLen / this.docCount : 1.0;

    // Calculate Robertson-Spärck Jones IDF
    this.idf.clear();
    for (const [token, postings] of this.invertedIndex.entries()) {
      const docFreq = postings.size;
      const idfScore = Math.log(1.0 + (this.docCount - docFreq + 0.5) / (docFreq + 0.5));
      this.idf.set(token, Math.max(0.05, idfScore));
    }
  }

  public search(query: string, topK: number = 5): Array<{ docIndex: number; score: number }> {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.docCount === 0) return [];

    const scores = new Map<number, number>();

    for (const token of queryTokens) {
      if (!this.invertedIndex.has(token)) continue;
      const tokenIDF = this.idf.get(token) || 0.1;
      const postings = this.invertedIndex.get(token)!;

      for (const [docIdx, freq] of postings.entries()) {
        const docLen = this.docLens[docIdx];
        const numerator = freq * (this.k1 + 1.0);
        const denominator = freq + this.k1 * (1.0 - this.b + this.b * (docLen / this.avgDocLen));
        const termScore = tokenIDF * (numerator / denominator);

        scores.set(docIdx, (scores.get(docIdx) || 0) + termScore);
      }
    }

    const sorted = Array.from(scores.entries())
      .map(([docIndex, score]) => ({ docIndex, score }))
      .sort((a, b) => b.score - a.score);

    return sorted.slice(0, topK);
  }
}
