"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { BusinessWithMembership } from "@/types";
import MerchantBusinessTable from "@/components/dashboard/businesses/merchant-business-table";
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
  Filter,
  Shield,
  Info,
  SortAsc,
  SortDesc,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type SetActiveAction = (formData: FormData) => Promise<void>;

export default function BusinessesExplorer({
  items,
  setActiveAction,
}: {
  items: BusinessWithMembership[];
  setActiveAction: SetActiveAction;
}) {

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [role, setRole] = useState<"any" | "owner" | "admin" | "member">("any");
  const [panelOpen, setPanelOpen] = useState(false); // NEW: collapsible on mobile
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = items.filter((b) => {
      // status
      if (status === "active" && !b.is_active) return false;
      if (status === "inactive" && b.is_active) return false;

      // role
      const myRole = b.membership?.[0]?.role ?? "";
      if (role !== "any" && myRole !== role) return false;

      // search
      if (!q) return true;
      const hay = `${b.name ?? ""} ${b.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      if (sort === "az") return (a.name ?? "").localeCompare(b.name ?? "");
      if (sort === "za") return (b.name ?? "").localeCompare(a.name ?? "");
      const ad = a.created_at ? new Date(a.created_at as string).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at as string).getTime() : 0;
      return sort === "newest" ? bd - ad : ad - bd;
    });

    return list;
  }, [items, query, sort, status, role]);

  return (
    <TooltipProvider>
      {/* Mobile toggle header */}
      <div className="mb-2 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-controls="businesses-explorer-controls"
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
          <span className="text-foreground">{items.length}</span>
        </div>
      </div>

      {/* Command Bar — collapsible on mobile, always open on md+ */}
      <div
        id="businesses-explorer-controls"
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
              placeholder="Search businesses…  (press /)"
              className="pl-9 bg-background/50"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search businesses"
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

            {/* Role filter */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center text-sm text-muted-foreground">
                <Shield className="mr-1 h-4 w-4" />
                Role
              </span>
              <Select
                value={role}
                onValueChange={(v: typeof role) => setRole(v)}
              >
                <SelectTrigger className="h-9 w-[160px] bg-background/50">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
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
                  <SelectItem value="newest">
                    <div className="inline-flex items-center gap-2">
                      <SortDesc className="h-4 w-4" /> Newest first
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="inline-flex items-center gap-2">
                      <SortAsc className="h-4 w-4" /> Oldest first
                    </div>
                  </SelectItem>
                  <SelectItem value="az">
                    <div className="inline-flex items-center gap-2">
                      <SortAsc className="h-4 w-4" /> Name A–Z
                    </div>
                  </SelectItem>
                  <SelectItem value="za">
                    <div className="inline-flex items-center gap-2">
                      <SortDesc className="h-4 w-4" /> Name Z–A
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            {/* Density */}

            {/* Primary action */}
            <Button asChild className="ml-1">
              <Link href="/dashboard/businesses/new">
                <Plus className="mr-2 h-4 w-4" />
                New business
              </Link>
            </Button>
          </div>
        </div>

        {/* Hairline info strip */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div aria-live="polite">
            Showing <span className="text-foreground">{filtered.length}</span>{" "}
            of <span className="text-foreground">{items.length}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            Use “Set as current” in the actions menu to switch context.
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={"text-sm"}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No businesses match your filters.
            <button
              onClick={() => {
                setQuery("");
                setSort("newest");
                setStatus("all");
                setRole("any");
              }}
              className="ml-2 underline underline-offset-4 hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <MerchantBusinessTable
            items={filtered}
            setActiveAction={setActiveAction}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
