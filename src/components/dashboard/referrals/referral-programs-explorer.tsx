// components/dashboard/referrals/referral-programs-explorer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MerchantReferralProgramsTable from "@/components/dashboard/referrals/merchant-referral-program-table";
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
  ArrowUpDown,
  Rows,
  StretchHorizontal,
  Gift,
  ShieldCheck,
  Info,
} from "lucide-react";
import { ReferralProgramRow } from "@/types";

export default function ReferralProgramsExplorer({
  programs,
}: {
  programs: ReferralProgramRow[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [rewards, setRewards] = useState<"all" | "any" | "both" | "none">(
    "all"
  );
  const [compact, setCompact] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Spotlight-style shortcuts
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
        inputRef.current?.focus();
      }
      if (!editing && (e.key === "c" || e.key === "C")) {
        setCompact((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = programs.filter((p) => {
      if (status === "active" && !p.is_active) return false;
      if (status === "inactive" && p.is_active) return false;

      const hasReferrer = Boolean(p.referrer_reward);
      const hasReferred = Boolean(p.referred_reward);
      const hasAny = hasReferrer || hasReferred;
      const hasBoth = hasReferrer && hasReferred;

      if (rewards === "any" && !hasAny) return false;
      if (rewards === "both" && !hasBoth) return false;
      if (rewards === "none" && hasAny) return false;

      if (!q) return true;
      const hay = [
        p.title,
        p.code,
        p.referrer_reward ?? "",
        p.referred_reward ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sort === "newest" ? bd - ad : ad - bd;
    });

    return list;
  }, [programs, query, sort, status, rewards]);

  return (
    <TooltipProvider>
      {/* Command Bar — glassy, quiet, icon-forward */}
      <div className="rounded-2xl border border-foreground/10 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl dark:bg-white/5 dark:border-white/15">
        <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search programs…  (press /)"
              className="pl-9 bg-background/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search referral programs"
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
            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="mr-1 h-4 w-4" />
                Status
              </span>
              <Select
                value={status}
                onValueChange={(v: typeof status) => setStatus(v)}
              >
                <SelectTrigger className="h-9 w-[140px] bg-background/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rewards filter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Gift className="mr-1 h-4 w-4" />
                Rewards
              </span>
              <Select
                value={rewards}
                onValueChange={(v: typeof rewards) => setRewards(v)}
              >
                <SelectTrigger className="h-9 w-[170px] bg-background/50">
                  <SelectValue placeholder="Rewards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="any">Any reward</SelectItem>
                  <SelectItem value="both">Referrer + Referred</SelectItem>
                  <SelectItem value="none">No rewards</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <ArrowUpDown className="mr-1 h-4 w-4" />
                Sort
              </span>
              <Select
                value={sort}
                onValueChange={(v: typeof sort) => setSort(v)}
              >
                <SelectTrigger className="h-9 w-[170px] bg-background/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="az">Title A–Z</SelectItem>
                  <SelectItem value="za">Title Z–A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            {/* Density */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCompact((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-sm shadow-sm backdrop-blur hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10"
                  aria-pressed={compact}
                  aria-label="Toggle compact density (c)"
                >
                  {compact ? (
                    <>
                      <Rows className="h-4 w-4 opacity-80" />
                      Compact
                    </>
                  ) : (
                    <>
                      <StretchHorizontal className="h-4 w-4 opacity-80" />
                      Comfortable
                    </>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>Press “c” to toggle density</TooltipContent>
            </Tooltip>

            {/* Primary action */}
            <Button asChild className="ml-1">
              <Link href="/dashboard/referrals/new">
                <Plus className="mr-2 h-4 w-4" />
                New program
              </Link>
            </Button>
          </div>
        </div>

        {/* Hairline info strip */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div aria-live="polite">
            Showing <span className="text-foreground">{filtered.length}</span>{" "}
            of <span className="text-foreground">{programs.length}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            “Both” = Referrer and Referred rewards configured.
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={compact ? "text-sm" : ""}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No programs match your filters.
            <button
              onClick={() => {
                setQuery("");
                setSort("newest");
                setStatus("all");
                setRewards("all");
              }}
              className="ml-2 underline underline-offset-4 hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <MerchantReferralProgramsTable programs={filtered} />
        )}
      </div>
    </TooltipProvider>
  );
}
