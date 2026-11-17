"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  BookOpen,
  Layers,
  Database,
  BarChart3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Building2,
  MapPin,
  Cpu,
  PlusCircle,
  X,
  FileText,
  CheckCircle2,
  Activity,
  Sliders,
  RefreshCw,
  GitMerge
} from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  category: string;
  text: string;
  entities: {
    organizations: string[];
    locations: string[];
    technologies: string[];
  };
  sentiment: "positive" | "neutral" | "challenging";
  sentiment_score: number;
}

interface CitationItem {
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

interface VisualAnalytics {
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

interface ChatResponse {
  query: string;
  answer: string;
  citations: CitationItem[];
  analytics: VisualAnalytics;
  retrievedCount: number;
  modeUsed: string;
}

const PRESET_QUERIES = [
  "What are Austria's 2030 targets for green hydrogen and electrolysis capacity?",
  "How is the Vienna Basin utilizing deep geothermal energy for municipal heating?",
  "What transmission bottlenecks is APG facing from rapid solar PV expansion?",
  "How is voestalpine decarbonizing industrial steel production in Linz?",
  "What are the environmental and supply chain debates surrounding lithium mining in Wolfsberg?"
];

export default function WebLyzardDashboard() {
  const [query, setQuery] = useState(PRESET_QUERIES[0]);
  const [retrievalMode, setRetrievalMode] = useState<"hybrid" | "vector_only" | "bm25_only">("hybrid");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"brief" | "evidence">("brief");
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [totalDocsCount, setTotalDocsCount] = useState<number>(12);

  // Ingest Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newCategory, setNewCategory] = useState("Renewable Generation");
  const [newText, setNewText] = useState("");
  const [newSentiment, setNewSentiment] = useState<"positive" | "neutral" | "challenging">("positive");
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
  const [ingestSuccessMessage, setIngestSuccessMessage] = useState<string | null>(null);

  // Initial fetch on mount
  useEffect(() => {
    executeSearch(PRESET_QUERIES[0], "hybrid");
  }, []);

  const executeSearch = async (searchQuery: string, mode: "hybrid" | "vector_only" | "bm25_only" = retrievalMode) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, mode, topK: 4 })
      });

      if (!res.ok) throw new Error("Search request failed");
      const data: ChatResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to execute RAG search:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    setIsSubmittingDoc(true);
    setIngestSuccessMessage(null);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          source: newSource || "Custom Web Ingest",
          category: newCategory,
          text: newText,
          sentiment: newSentiment,
          organizations: ["Industrial Transition Taskforce"],
          locations: ["Austria", "Central Europe"],
          technologies: [newCategory]
        })
      });

      const data = await res.json();
      if (data.success) {
        setTotalDocsCount(data.totalDocuments);
        setIngestSuccessMessage(`Successfully vectorized and indexed "${newTitle}"!`);
        setTimeout(() => {
          setIsIngestModalOpen(false);
          setIngestSuccessMessage(null);
          setNewTitle("");
          setNewSource("");
          setNewText("");
          // Run search on new topic
          executeSearch(newTitle);
        }, 1500);
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1b] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-cyan-900/30 bg-[#0a1527]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-300/30">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                webLyzard Intelligence Hub
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                Hybrid RAG v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Neuro-Symbolic Information Retrieval: BM25 Lexical + Gemini 768d Vector Space
            </p>
          </div>
        </div>

        {/* Global Live Corpus Metrics */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Indexed Corpus:</span>
            <span className="font-semibold text-cyan-300">{totalDocsCount} Reports</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">Target Domain:</span>
            <span className="font-semibold text-slate-200">Austrian Clean Energy & Climate Policy</span>
          </div>
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Ingest Document</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">
        
        {/* Search & Mode Bar */}
        <section className="bg-[#0b182d]/90 rounded-2xl border border-cyan-900/40 p-4 lg:p-5 shadow-xl shadow-black/40 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-cyan-400/70" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeSearch(query)}
                placeholder="Search policy archives (e.g. green hydrogen in Linz, geothermal heating, APG grid curtailment)..."
                className="w-full pl-11 pr-4 py-3 bg-[#071120] rounded-xl border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 text-sm md:text-base transition-all"
              />
            </div>
            <button
              onClick={() => executeSearch(query)}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer min-w-[130px]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {/* Mode Selector & Preset Queries */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            {/* Retrieval Mode Pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-medium">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" /> Mode:
              </span>
              <button
                onClick={() => {
                  setRetrievalMode("hybrid");
                  executeSearch(query, "hybrid");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  retrievalMode === "hybrid"
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300/40"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <GitMerge className="h-3 w-3" />
                <span>Hybrid (BM25 + Semantic)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">Recommended</span>
              </button>
              <button
                onClick={() => {
                  setRetrievalMode("vector_only");
                  executeSearch(query, "vector_only");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  retrievalMode === "vector_only"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Dense Semantic Only
              </button>
              <button
                onClick={() => {
                  setRetrievalMode("bm25_only");
                  executeSearch(query, "bm25_only");
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  retrievalMode === "bm25_only"
                    ? "bg-slate-700 text-white shadow-md"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                Exact BM25 Lexical
              </button>
            </div>

            {/* Total Retrieved Status */}
            {result && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Retrieved <strong className="text-white">{result.retrievedCount} verified chunks</strong> in {result.modeUsed} mode</span>
              </div>
            )}
          </div>

          {/* Quick-Preset Query Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mr-1">
              Sample Prompts:
            </span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(preset);
                  executeSearch(preset);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900/70 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-600/50 text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer text-left truncate max-w-[280px]"
                title={preset}
              >
                {preset}
              </button>
            ))}
          </div>
        </section>

        {/* Dual-Pane Dashboard: Left (RAG & Evidence), Right (webLyzard Visual Intelligence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (7 Cols): Grounded RAG Synthesizer & Evidence Drawer */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("brief")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeTab === "brief"
                      ? "bg-cyan-950/80 border border-cyan-500/50 text-cyan-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>RAG Intelligence Synthesis</span>
                </button>
                <button
                  onClick={() => setActiveTab("evidence")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    activeTab === "evidence"
                      ? "bg-cyan-950/80 border border-cyan-500/50 text-cyan-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Retrieved Evidence Chunks ({result?.citations.length ?? 0})</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                Source Attribution Grounded
              </span>
            </div>

            {/* TAB CONTENT 1: RAG Intelligence Synthesis */}
            {activeTab === "brief" && (
              <div className="bg-[#0b162a]/95 rounded-2xl border border-slate-800/80 p-5 lg:p-6 shadow-xl relative min-h-[380px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="h-10 w-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-cyan-300 font-medium">Extracting semantic evidence & synthesizing brief...</p>
                    <p className="text-xs text-slate-500">Reciprocal Rank Fusion matching dense vectors with Okapi BM25</p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {/* Source citations header pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-800/80">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mr-1">
                        Citations Used:
                      </span>
                      {result.citations.map((c, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300 font-mono flex items-center gap-1"
                          title={`${c.title} (${c.source})`}
                        >
                          {c.label} {c.category}
                        </span>
                      ))}
                    </div>

                    {/* Formatted Markdown-like Response */}
                    <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed space-y-3">
                      {result.answer.split("\n\n").map((para, pIdx) => {
                        if (para.startsWith("### ")) {
                          return (
                            <h3 key={pIdx} className="text-cyan-300 font-bold text-base mt-4 mb-2 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-cyan-400" />
                              {para.replace("### ", "").replace(/\*\*/g, "")}
                            </h3>
                          );
                        }
                        if (para.startsWith("- ") || para.startsWith("* ")) {
                          const bullets = para.split("\n").filter(Boolean);
                          return (
                            <ul key={pIdx} className="space-y-1.5 my-2 pl-4 list-disc marker:text-cyan-400">
                              {bullets.map((b, bIdx) => (
                                <li key={bIdx} className="text-slate-300 text-sm leading-normal">
                                  {b.replace(/^[-*]\s*/, "")}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={pIdx} className="text-slate-300 text-sm leading-relaxed">
                            {para}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400 text-sm">
                    Enter a query or select a preset prompt above to generate a brief.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: Evidence Source Chunks */}
            {activeTab === "evidence" && (
              <div className="space-y-3">
                {result?.citations.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0b162a]/95 rounded-xl border border-slate-800 p-4 hover:border-cyan-500/50 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                          {c.label}
                        </span>
                        <h4 className="text-sm font-semibold text-white leading-snug">{c.title}</h4>
                      </div>
                      <span className="text-[11px] text-cyan-400 font-mono whitespace-nowrap bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                        Score: {(c.score * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span><strong>Publisher:</strong> {c.source}</span>
                      <span>•</span>
                      <span><strong>Category:</strong> {c.category}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">BM25: {c.bm25Score.toFixed(3)} | Vector: {c.vectorScore.toFixed(3)}</span>
                    </div>

                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium pt-1"
                    >
                      <span>View Official Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (5 Cols): webLyzard Visual Intelligence & NLP Analytics */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Visual Analytics Box 1: Sentiment & Polarity Distribution */}
            <div className="bg-[#0b162a]/95 rounded-2xl border border-slate-800/80 p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span>Media Sentiment & Polarity</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  result?.analytics.avgSentimentScore ?? 0 > 0.2
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/50"
                    : result?.analytics.avgSentimentScore ?? 0 < -0.1
                    ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
                    : "bg-amber-950/80 text-amber-300 border border-amber-800/50"
                }`}>
                  {result?.analytics.sentimentLabel ?? "Neutral"}
                </span>
              </div>

              {/* Progress bar breakdown */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-slate-900 flex overflow-hidden p-0.5 ring-1 ring-slate-800">
                  <div
                    style={{ width: `${result?.analytics.sentimentPercentages.positive ?? 50}%` }}
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    title={`Positive: ${result?.analytics.sentimentPercentages.positive ?? 50}%`}
                  />
                  <div
                    style={{ width: `${result?.analytics.sentimentPercentages.neutral ?? 35}%` }}
                    className="h-full bg-amber-500 transition-all duration-500"
                    title={`Neutral: ${result?.analytics.sentimentPercentages.neutral ?? 35}%`}
                  />
                  <div
                    style={{ width: `${result?.analytics.sentimentPercentages.challenging ?? 15}%` }}
                    className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                    title={`Challenging: ${result?.analytics.sentimentPercentages.challenging ?? 15}%`}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Positive ({result?.analytics.sentimentPercentages.positive ?? 50}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Neutral ({result?.analytics.sentimentPercentages.neutral ?? 35}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Critical ({result?.analytics.sentimentPercentages.challenging ?? 15}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Analytics Box 2: webLyzard Named Entity Co-occurrence */}
            <div className="bg-[#0b162a]/95 rounded-2xl border border-slate-800/80 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span>Extracted Entity Co-occurrences</span>
                </div>
                <span className="text-[11px] text-slate-500">webLyzard NLP Core</span>
              </div>

              {/* Organizations */}
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-cyan-400" /> Key Stakeholders & Organizations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(result?.analytics.topOrganizations || [
                    { name: "VERBUND", count: 4 },
                    { name: "BMK", count: 3 },
                    { name: "voestalpine", count: 3 },
                    { name: "Wien Energie", count: 2 },
                    { name: "APG", count: 2 }
                  ]).map((org, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(`Impact and projects of ${org.name}`);
                        executeSearch(`Impact and projects of ${org.name}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{org.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-mono">
                        {org.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Technologies */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-sky-400" /> Technology Clusters
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(result?.analytics.topTechnologies || [
                    { name: "Electrolysis", count: 3 },
                    { name: "Deep Geothermal", count: 2 },
                    { name: "Pumped Hydro", count: 2 },
                    { name: "Electric Arc Furnace", count: 2 },
                    { name: "CCUS", count: 1 }
                  ]).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-800/40 text-[11px] text-sky-300 font-medium"
                    >
                      #{tech.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Geographic Locations */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/50">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-400" /> Geographic Regions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(result?.analytics.topLocations || [
                    { name: "Austria", count: 6 },
                    { name: "Linz", count: 2 },
                    { name: "Vienna", count: 2 },
                    { name: "Salzburg", count: 2 }
                  ]).map((loc, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
                    >
                      📍 {loc.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Architecture Explainer Box */}
            <div className="bg-[#0b162a]/95 rounded-2xl border border-slate-800/80 p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-slate-800 pb-2">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <span>Retrieval Pipeline Inspector</span>
              </div>
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="font-mono text-cyan-300">1. Lexical Branch</span>
                  <span>Okapi BM25 (k1=1.5, b=0.75)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="font-mono text-sky-300">2. Dense Vector</span>
                  <span>Gemini text-embedding-004 (Cosine)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="font-mono text-emerald-300">3. Rank Fusion</span>
                  <span>Reciprocal Rank Fusion (RRF k=60)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="font-mono text-purple-300">4. Grounded GenAI</span>
                  <span>Gemini 2.5 Flash Strict Synthesis</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Ingest Document Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b162a] border border-cyan-800/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsIngestModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-cyan-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ingest Custom Policy Report</h3>
                <p className="text-xs text-slate-400">Add an article to live-chunk, vectorize, and search immediately.</p>
              </div>
            </div>

            {ingestSuccessMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{ingestSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleIngestSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Austrian Hydrogen Pipeline Network Expansion..."
                  className="w-full px-3 py-2 bg-[#071120] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source / Author</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="e.g. Austrian Energy Agency"
                    className="w-full px-3 py-2 bg-[#071120] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#071120] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="Hydrogen & Storage">Hydrogen & Storage</option>
                    <option value="Grid Infrastructure">Grid Infrastructure</option>
                    <option value="Renewable Generation">Renewable Generation</option>
                    <option value="Geothermal & Heating">Geothermal & Heating</option>
                    <option value="Industrial Decarbonization">Industrial Decarbonization</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sentiment Polarity</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewSentiment("positive")}
                    className={`py-1.5 rounded-lg border font-medium ${
                      newSentiment === "positive"
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Positive
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSentiment("neutral")}
                    className={`py-1.5 rounded-lg border font-medium ${
                      newSentiment === "neutral"
                        ? "bg-amber-950 border-amber-500 text-amber-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Neutral
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSentiment("challenging")}
                    className={`py-1.5 rounded-lg border font-medium ${
                      newSentiment === "challenging"
                        ? "bg-rose-950 border-rose-500 text-rose-300"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    Challenging
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Text Chunk *</label>
                <textarea
                  required
                  rows={4}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Paste article or policy text excerpt here..."
                  className="w-full px-3 py-2 bg-[#071120] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDoc}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-cyan-600/30 disabled:opacity-50"
                >
                  {isSubmittingDoc ? "Vectorizing..." : "Index into Corpus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070e1b] py-4 px-6 text-center text-xs text-slate-500">
        webLyzard Web Intelligence & Hybrid RAG Engine • Built for Applied GenAI & Semantic Search • Vienna, Austria
      </footer>
    </div>
  );
}
