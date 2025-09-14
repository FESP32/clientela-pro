"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MerchantSurveysTable from "@/components/dashboard/surveys/merchant-surveys-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
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
  Info,
  Filter,
  Shield,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SurveyWithProduct } from "@/types";

export default function SurveysExplorer({
  surveys,
  deleteSurvey,
}: {
  surveys: SurveyWithProduct[];
  deleteSurvey: (id: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [privacy, setPrivacy] = useState<"all" | "anonymous" | "named">("all");
  const [windowSel, setWindowSel] = useState<
    "any" | "live" | "upcoming" | "ended"
  >("any");
  const [panelOpen, setPanelOpen] = useState(false); // collapsible on mobile
  const inputRef = useRef<HTMLInputElement>(null);

  // Always open on md+; collapsible on mobile
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

  const now = new Date();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const inWindow = (s: SurveyWithProduct) => {
      const start = s.starts_at ? new Date(s.starts_at).getTime() : undefined;
      const end = s.ends_at ? new Date(s.ends_at).getTime() : undefined;
      const ts = now.getTime();

      if (windowSel === "any") return true;
      if (windowSel === "live") {
        const afterStart = start === undefined || ts >= start;
        const beforeEnd = end === undefined || ts <= end;
        return afterStart && beforeEnd;
      }
      if (windowSel === "upcoming") {
        return start !== undefined && ts < start;
      }
      if (windowSel === "ended") {
        return end !== undefined && ts > end;
      }
      return true;
    };

    let list = surveys.filter((s) => {
      // status (fixed logic)
      if (status === "active" && s.status !== "active") return false;
      if (status === "inactive" && s.status !== "inactive") return false;

      // privacy
      if (privacy === "anonymous" && !s.is_anonymous) return false;
      if (privacy === "named" && s.is_anonymous) return false;

      // time window
      if (!inWindow(s)) return false;

      // search
      if (!q) return true;
      const hay = [s.title ?? "", s.description ?? "", s.product?.name ?? ""]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });

    // sort
    list = [...list].sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);

      const ad =
        a.created_at ?? a.starts_at
          ? new Date((a.created_at ?? a.starts_at)!).getTime()
          : 0;
      const bd =
        b.created_at ?? b.starts_at
          ? new Date((b.created_at ?? b.starts_at)!).getTime()
          : 0;
      return sort === "newest" ? bd - ad : ad - bd;
    });

    return list;
  }, [surveys, query, sort, status, privacy, windowSel, now]);

  return (
    <TooltipProvider>
      {/* Mobile toggle header */}
      <div className="mb-2 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-controls="surveys-explorer-controls"
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
          <span className="text-foreground">{surveys.length}</span>
        </div>
      </div>

      {/* Command Bar — collapsible on mobile, always open on md+ */}
      <div
        id="surveys-explorer-controls"
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
              placeholder="Search surveys…"
              className="pl-9 bg-background/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search surveys"
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
                <Filter className="mr-1 h-4 w-4" />
                Status
              </span>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as typeof status)}
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

            {/* Privacy filter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Shield className="mr-1 h-4 w-4" />
                Privacy
              </span>
              <Select
                value={privacy}
                onValueChange={(v) => setPrivacy(v as typeof privacy)}
              >
                <SelectTrigger className="h-9 w-[150px] bg-background/50">
                  <SelectValue placeholder="Privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                  <SelectItem value="named">Named</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Window filter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <ArrowUpDown className="mr-1 h-4 w-4" />
                Window
              </span>
              <Select
                value={windowSel}
                onValueChange={(v) => setWindowSel(v as typeof windowSel)}
              >
                <SelectTrigger className="h-9 w-[170px] bg-background/50">
                  <SelectValue placeholder="Window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any time</SelectItem>
                  <SelectItem value="live">Live now</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
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
                onValueChange={(v) => setSort(v as typeof sort)}
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

            {/* Add survey */}
            <Button asChild className="ml-1">
              <Link href="/dashboard/surveys/new">
                <Plus className="mr-2 h-4 w-4" />
                New survey
              </Link>
            </Button>
          </div>
        </div>

        {/* Hairline info strip */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div aria-live="polite">
            Showing <span className="text-foreground">{filtered.length}</span>{" "}
            of <span className="text-foreground">{surveys.length}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={"text-sm mb-12"}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No surveys match your filters.
            <button
              onClick={() => {
                setQuery("");
                setSort("newest");
                setStatus("all");
                setPrivacy("all");
                setWindowSel("any");
              }}
              className="ml-2 underline underline-offset-4 hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <MerchantSurveysTable
            surveys={filtered}
            deleteSurvey={deleteSurvey}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
