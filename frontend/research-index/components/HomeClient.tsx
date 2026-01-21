"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import SearchInput from "@/components/SearchInput";
import PaperCard, { type Paper } from "@/components/PaperCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

function normalizePapers(payload: any): Paper[] {
  const rawList: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.papers)
        ? payload.papers
        : [];

  return rawList.map((p: any, idx: number) => {
    const title = String(p?.title ?? p?.paper_title ?? "Untitled").trim();
    const summary = String(p?.summary ?? p?.abstract ?? p?.paper_abstract ?? "").trim();

    const rawScore = Number(p?.relevance ?? p?.similarity ?? p?.similarity_score ?? p?.cosine ?? NaN);
    const score =
      Number.isFinite(rawScore) && rawScore <= 1 ? rawScore : Number.isFinite(rawScore) ? rawScore / 100 : undefined;

    const url =
      String(p?.url ?? p?.arxiv_url ?? p?.link ?? "").trim() ||
      (p?.arxiv_id ? `https://arxiv.org/abs/${String(p.arxiv_id).trim()}` : "https://arxiv.org");

    const id = String(p?.id ?? p?.paper_id ?? p?.arxiv_id ?? p?.rank ??idx).trim() || String(idx);

    return { id, title, summary, score, url } satisfies Paper;
  });
}

export default function HomeClient() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const kFromUrl = clampInt(Number(searchParams.get("k") ?? 5), 1, 50);
  const k = kFromUrl || 5;

  const [papers, setPapers] = React.useState<Paper[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    abortRef.current?.abort();
    setError(null);

    if (!q) {
      setPapers([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch("api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, k }),
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed: ${res.status}`);
        }

        const json = await res.json();
        setPapers(normalizePapers(json));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Something went wrong.");
        setPapers([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [q, k]);

  const examples = [
    "diffusion models",
    "graph neural networks",
    "quantum error correction",
    "retrieval augmented generation",
  ];

  return (
    <div className="min-h-dvh bg-background">
      {/* premium background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,hsl(var(--primary)/0.20)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_15%_15%,hsl(var(--muted-foreground)/0.12)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,hsl(var(--background))_55%)]" />
      </div>

      {/* top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
              <span className="text-sm font-semibold text-primary">Re</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Research Paper Finder</div>
              <div className="text-xs text-muted-foreground">Semantic paper search</div>
            </div>
          </div>

        
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        {/* hero */}
        <section className="relative overflow-hidden rounded-3xl border bg-card/40 p-6 ring-1 ring-border backdrop-blur sm:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Find papers fast,{" "}
                  <span className="text-primary">understand them faster</span>
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Type a topic and get the closest papers from your semantic index.
                  Your query stays in the URL, so sharing and bookmarking is instant.
                </p>
              </div>

              <div className="flex gap-2">
                <Badge className="bg-primary/15 text-primary ring-1 ring-primary/20">FastAPI</Badge>
                {/* Let users input the number of search results they want */}
                <Badge variant="secondary" className="bg-card/50 ring-1 ring-border">
                  k=5
                </Badge>
              </div>
            </div>

            <div className="mt-6">
              <SearchInput />
            </div>

            {!q ? (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Try:</span>
                {examples.map((ex) => (
                  <ExampleQueryButton key={ex} query={ex} />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* results */}
        <section className="mt-10">
          {error ? (
            <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </Card>
          ) : null}

          {loading ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="relative overflow-hidden p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_30%_0%,hsl(var(--primary)/0.10)_0%,transparent_60%)]" />
                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-10/12" />
                    </div>
                    <div className="pt-2">
                      <Skeleton className="h-9 w-36 rounded-xl" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          {!loading && q ? (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Results for <span className="text-foreground font-medium">“{q}”</span>
                </div>
                <Badge variant="secondary" className="bg-card/50 ring-1 ring-border">
                  {papers.length} returned
                </Badge>
              </div>

              {papers.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-sm text-muted-foreground">
                    No matches found. Try a broader query or fewer keywords.
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {papers.map((p) => (
                    <PaperCard key={p.id} paper={p} />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>

        <footer className="mt-14 text-center text-xs text-muted-foreground">
          Built for research flow, clean typography, and low-latency search.
        </footer>
      </main>
    </div>
  );
}

function ExampleQueryButton({ query }: { query: string }) {
  // URL is updated by SearchInput debounce anyway, this just fills the input using a little trick:
  // We set location search params directly to keep it simple and instant.
  const onClick = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState(null, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="h-8 rounded-full bg-background/40 ring-1 ring-border hover:bg-background/60"
      onClick={onClick}
    >
      {query}
    </Button>
  );
}
function clampInt(val: number, min: number, max: number) {
  if (Number.isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}

