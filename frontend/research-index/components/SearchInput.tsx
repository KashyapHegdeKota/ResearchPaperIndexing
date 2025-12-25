"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

export default function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQ = (searchParams.get("q") ?? "").toString();
  const urlK = clampInt(Number(searchParams.get("k") ?? 5), 1, 50);

  const [value, setValue] = React.useState(urlQ);
  const [k, setK] = React.useState<number>(urlK || 5);

  const debounced = useDebouncedValue(value, 300);

  React.useEffect(() => setValue(urlQ), [urlQ]);
  React.useEffect(() => setK(urlK || 5), [urlK]);

  // Debounced query updates URL
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const next = debounced.trim();
    const current = urlQ.trim();

    if (next === current) return;

    if (!next) params.delete("q");
    else params.set("q", next);

    if (!params.get("k")) params.set("k", String(k));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, pathname, router]);

  // k updates URL immediately
  const onKChange = (nextStr: string) => {
    const nextK = clampInt(Number(nextStr), 1, 50);
    setK(nextK);

    const params = new URLSearchParams(searchParams.toString());
    params.set("k", String(nextK));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onClear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.set("k", String(k));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="w-full">
      <div className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-[1fr_140px]">
        <div className="relative rounded-2xl border bg-background/40 ring-1 ring-border backdrop-blur focus-within:ring-2 focus-within:ring-primary/35">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search papers, methods, concepts, authors..."
            className="h-14 border-0 bg-transparent pl-12 pr-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Search papers"
          />
          {value.trim().length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl hover:bg-muted/50"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <Select value={String(k)} onValueChange={onKChange}>
          <SelectTrigger className="h-14 rounded-2xl bg-background/40 ring-1 ring-border backdrop-blur">
            <SelectValue placeholder="k" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Top 3</SelectItem>
            <SelectItem value="5">Top 5</SelectItem>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="20">Top 20</SelectItem>
            <SelectItem value="50">Top 50</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
