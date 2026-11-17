import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "webLyzard Web Intelligence Hub | Hybrid RAG & Visual Analytics",
  description: "Neuro-Symbolic Information Retrieval and Semantic Search Engine combining Okapi BM25 with Dense Gemini Embeddings for Climate & Clean Energy Intelligence.",
  keywords: ["webLyzard", "Semantic Search", "RAG", "BM25", "Vector Search", "Gemini", "Clean Energy", "Austria"],
};

export default function RootLayout({
  children,
}: ReadEventProps<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070e1b] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

// Helper type for Next.js layout props
type ReadEventProps<T> = T;
