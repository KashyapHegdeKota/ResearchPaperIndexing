import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type Paper = {
  id: string;
  title: string;
  summary: string;
  score?: number; // ideally 0..1
  url?: string;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function PaperCard({ paper }: { paper: Paper }) {
  const score01 = paper.score != null && Number.isFinite(paper.score) ? clamp01(paper.score) : null;
  const scorePct = score01 != null ? Math.round(score01 * 100) : null;

  return (
    <Card className="group relative overflow-hidden border bg-card/45 p-5 ring-1 ring-border backdrop-blur transition hover:bg-card/55 hover:shadow-[0_18px_45px_-28px_hsl(var(--primary)/0.55)]">
      {/* subtle gradient sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-pretty text-base font-semibold leading-snug tracking-tight sm:text-lg">
            {paper.title}
          </h3>

          {scorePct != null ? (
            <Badge className="shrink-0 rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
              Similarity {scorePct}%
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0 rounded-full bg-card/50 ring-1 ring-border">
              No score
            </Badge>
          )}
        </div>

        {score01 != null ? (
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-muted/60 ring-1 ring-border">
              <div
                className="h-2 rounded-full bg-primary/70 transition-[width] duration-300"
                style={{ width: `${scorePct}%` }}
              />
            </div>
          </div>
        ) : null}

        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {paper.summary || "No summary available."}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Paper ID <span className="text-foreground/90">{paper.id}</span>
          </div>

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:shadow"
          >
            <a href={paper.url || "https://arxiv.org"} target="_blank" rel="noreferrer">
              View on ArXiv <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
