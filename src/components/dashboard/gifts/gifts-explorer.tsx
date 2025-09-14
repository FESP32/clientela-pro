// components/dashboard/gifts/gifts-explorer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MerchantGiftsTable from "@/components/dashboard/gifts/merchant-gift-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Rows,
  StretchHorizontal,
  ArrowUpDown,
  Filter,
  Image as ImageIcon,
  Info,
  SortAsc,
  SortDesc,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GiftRow } from "@/types";

export default function GiftsExplorer({ gifts }: { gifts: GiftRow[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"az" | "za" | "with" | "without">("az");
  const [imageFilter, setImageFilter] = useState<"any" | "with" | "without">(
    "any"
  );
  const [panelOpen, setPanelOpen] = useState(false); // collapsible on mobile
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep panel open on md+; collapsible on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPanelOpen(mq.matches ? true : false);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Spotlight-like shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const editing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          (t as HTMLElement).isContentEditable);

      if (!editing && e.key === "/") {
        e.preventDefault();
        setPanelOpen(true); // auto-open on mobile
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = gifts.filter((g) => {
      if (!q) return true;
      return (g.title ?? "").toLowerCase().includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "az") return (a.title ?? "").localeCompare(b.title ?? "");
      if (sort === "za") return (b.title ?? "").localeCompare(a.title ?? "");
      return 0;
    });

    return list;
  }, [gifts, query, sort, imageFilter]);

  return (
    <TooltipProvider>
      {/* Mobile toggle header */}
      <div className="mb-2 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-controls="gifts-explorer-controls"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Search & Filters
          {panelOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        <div className="text-xs text-muted-foreground">
          Showing <span className="text-foreground">{filtered.length}</span> of{" "}
          <span className="text-foreground">{gifts.length}</span>
        </div>
      </div>

      {/* Command Bar — collapsible on mobile, always open on md+ */}
      <div
        id="gifts-explorer-controls"
        className={`${
          panelOpen ? "block" : "hidden"
        } md:block rounded-2xl border border-foreground/10 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl dark:bg-white/5 dark:border-white/15`}
      >
        <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search gifts…  (press /)"
              className="pl-9 bg-background/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search gifts"
            />
            {query && (
              <kbd
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer select-none rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                title="Clear"
              >
                Esc
              </kbd>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <ArrowUpDown className="mr-1 h-4 w-4" />
                Sort
              </span>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as typeof sort)}
              >
                <SelectTrigger className="h-9 w-[170px] bg-background/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">
                    <div className="inline-flex items-center gap-2">
                      <SortAsc className="h-4 w-4" /> Title A–Z
                    </div>
                  </SelectItem>
                  <SelectItem value="za">
                    <div className="inline-flex items-center gap-2">
                      <SortDesc className="h-4 w-4" /> Title Z–A
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            {/* Primary action */}
            <Button asChild className="ml-1">
              <Link href="/dashboard/gifts/new">
                <Plus className="mr-2 h-4 w-4" />
                New gift
              </Link>
            </Button>
          </div>
        </div>

        {/* Hairline info strip */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div aria-live="polite">
            Showing <span className="text-foreground">{filtered.length}</span>{" "}
            of <span className="text-foreground">{gifts.length}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={"text-sm mb-16"}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No gifts match your filters.
            <button
              onClick={() => {
                setQuery("");
                setSort("az");
                setImageFilter("any");
              }}
              className="ml-2 underline underline-offset-4 hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <MerchantGiftsTable gifts={filtered} />
        )}
      </div>
    </TooltipProvider>
  );
}
