"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MerchantStampCardsTable from "@/components/dashboard/stamps/merchant-stamp-cards-table";
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
  Filter,
  PackageCheck,
  CalendarClock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StampCardListItem } from "@/types";

export default function StampCardsExplorer({
  cards,
  deleteStampCard,
}: {
  cards: StampCardListItem[];
  deleteStampCard: (formData: FormData) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [windowSel, setWindowSel] = useState<
    "any" | "live" | "upcoming" | "expired"
  >("any");
  const [products, setProducts] = useState<"all" | "with" | "without">("all");
  const [panelOpen, setPanelOpen] = useState(false); // collapsible on mobile
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep panel always open on md+; collapsible on mobile
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

  const now = Date.now();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const inWindow = (c: StampCardListItem) => {
      const start = c.valid_from ? new Date(c.valid_from).getTime() : undefined;
      const end = c.valid_to ? new Date(c.valid_to).getTime() : undefined;
      if (windowSel === "any") return true;
      if (windowSel === "live") {
        const afterStart = start === undefined || now >= start;
        const beforeEnd = end === undefined || now <= end;
        return afterStart && beforeEnd;
      }
      if (windowSel === "upcoming") return start !== undefined && now < start;
      if (windowSel === "expired") return end !== undefined && now > end;
      return true;
    };

    let list = cards.filter((c) => {
      // status (fixed)
      if (status === "active" && c.status !== "active") return false;
      if (status === "inactive" && c.status !== "inactive") return false;

      // products
      if (products === "with" && !(c.product_count ?? 0)) return false;
      if (products === "without" && (c.product_count ?? 0) > 0) return false;

      // time window
      if (!inWindow(c)) return false;

      // search
      if (!q) return true;
      const hay = [c.title ?? "", c.goal_text ?? ""].join(" ").toLowerCase();
      return hay.includes(q);
    });

    // sort
    list = [...list].sort((a, b) => {
      if (sort === "az") return (a.title ?? "").localeCompare(b.title ?? "");
      if (sort === "za") return (b.title ?? "").localeCompare(a.title ?? "");
      const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sort === "newest" ? bd - ad : ad - bd;
    });

    return list;
  }, [cards, query, sort, status, windowSel, products, now]);

  return (
    <TooltipProvider>
      {/* Mobile toggle header */}
      <div className="mb-2 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-controls="stampcards-explorer-controls"
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
          <span className="text-foreground">{cards.length}</span>
        </div>
      </div>

      {/* Command Bar — collapsible on mobile, always open on md+ */}
      <div
        id="stampcards-explorer-controls"
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
              placeholder="Search cards…"
              className="pl-9 bg-background/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search cards"
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

            {/* Window filter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <CalendarClock className="mr-1 h-4 w-4" />
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
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products filter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <PackageCheck className="mr-1 h-4 w-4" />
                Products
              </span>
              <Select
                value={products}
                onValueChange={(v) => setProducts(v as typeof products)}
              >
                <SelectTrigger className="h-9 w-[160px] bg-background/50">
                  <SelectValue placeholder="Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="with">With products</SelectItem>
                  <SelectItem value="without">Without products</SelectItem>
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

            {/* Add card */}
            <Button asChild className="ml-1">
              <Link href="/dashboard/stamps/new">
                <Plus className="mr-2 h-4 w-4" />
                New card
              </Link>
            </Button>
          </div>
        </div>

        {/* Hairline info strip */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div aria-live="polite">
            Showing <span className="text-foreground">{filtered.length}</span>{" "}
            of <span className="text-foreground">{cards.length}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={"text-sm mb-16"}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No cards match your filters.
            <button
              onClick={() => {
                setQuery("");
                setSort("newest");
                setStatus("all");
                setWindowSel("any");
                setProducts("all");
              }}
              className="ml-2 underline underline-offset-4 hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <MerchantStampCardsTable
            cards={filtered}
            deleteStampCard={deleteStampCard}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
