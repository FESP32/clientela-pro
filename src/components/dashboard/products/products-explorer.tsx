"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  ArrowUpDown,
  Rows,
  StretchHorizontal,
  Info,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MerchantProductsTable from "@/components/dashboard/products/merchant-products-table";
import { ProductRow } from "@/types";

export default function ProductsExplorer({
  products,
  deleteProduct,
}: {
  products: ProductRow[];
  deleteProduct: (formData: FormData) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "az" | "za">("newest");
  const [panelOpen, setPanelOpen] = useState(false); // collapsed on mobile by default
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep panel always open on md+; collapsible on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setPanelOpen(mq.matches ? true : false);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);

      if (!editing && e.key === "/") {
        e.preventDefault();
        setPanelOpen(true); // auto-open on mobile
        // focus after open
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = !q
      ? products
      : products.filter((p) => {
          const inName = p.name?.toLowerCase().includes(q);
          const inMeta = JSON.stringify(p.metadata ?? {})
            .toLowerCase()
            .includes(q);
          return inName || inMeta;
        });

    list = [...list].sort((a, b) => {
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "za") return b.name.localeCompare(a.name);
      const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sort === "newest" ? bd - ad : ad - bd;
    });

    return list;
  }, [products, query, sort]);

  return (
    <TooltipProvider>
      {/* Mobile header with toggle */}
      <div className="mb-2 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          aria-expanded={panelOpen}
          aria-controls="products-explorer-controls"
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
          <span className="text-foreground">{products.length}</span>
        </div>
      </div>

      {/* Command Bar (collapsible on mobile, always open on md+) */}
      <div
        id="products-explorer-controls"
        className={`${
          panelOpen ? "block" : "hidden"
        } md:block rounded-xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md`}
      >
        <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
          {/* Left: Search */}
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search products"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
              >
                Esc
              </button>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center text-sm text-muted-foreground">
                    <ArrowUpDown className="mr-1 h-4 w-4" />
                    Sort
                  </span>
                </TooltipTrigger>
                <TooltipContent>Change listing order</TooltipContent>
              </Tooltip>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as typeof sort)}
              >
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="az">Name A–Z</SelectItem>
                  <SelectItem value="za">Name Z–A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="hidden h-6 md:block" />

            {/* Primary action */}
            <Button asChild className="ml-1">
              <Link href="/dashboard/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add product
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <div aria-live="polite">
            Showing <span className="text-foreground">{filtered.length}</span>{" "}
            of <span className="text-foreground">{products.length}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={"text-sm mb-16"}>
        {filtered.length === 0 ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">
            No products match your filters.
            <button
              onClick={() => {
                setQuery("");
                setSort("newest");
              }}
              className="ml-2 underline underline-offset-4 hover:text-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <MerchantProductsTable
            products={filtered}
            deleteProduct={deleteProduct}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
