// components/common/list-explorer-table-loading.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

/** Tiny skeleton building block */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-pulse rounded-md bg-muted/70 dark:bg-muted/40",
        className
      )}
    />
  );
}

/** Explorer (command bar) skeleton */
function ExplorerSkeleton() {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl dark:bg-white/5 dark:border-white/15">
      {/* Top row */}
      <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="w-full md:max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-muted/50" />
            <Skeleton className="h-9 w-full rounded-md pl-9" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Select 1 */}
          <Skeleton className="h-9 w-[150px] rounded-md" />
          {/* Select 2 */}
          <Skeleton className="h-9 w-[170px] rounded-md" />
          {/* Density chip */}
          <Skeleton className="h-8 w-[140px] rounded-full" />
          {/* Primary action */}
          <Skeleton className="h-9 w-[140px] rounded-md" />
        </div>
      </div>

      {/* Hairline info strip */}
      <div className="border-t px-3 py-2">
        <Skeleton className="h-3 w-40 rounded" />
      </div>
    </div>
  );
}

/** Mobile card placeholder */
function MobileCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex flex-wrap gap-2 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

/** Desktop table placeholder */
function TableSkeleton({
  rows = 8,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="hidden md:block  overflow-x-auto">
      {/* Header */}
      <div className="min-w-[720px]">
        <div
          className="grid grid-cols-[repeat(var(--cols),minmax(120px,1fr))] border-b px-3 py-2"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={{ ["--cols" as any]: cols }}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4 w-3/5" />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={`r-${r}`}
            className="grid grid-cols-[repeat(var(--cols),minmax(120px,1fr))] items-center px-3 py-3"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ ["--cols" as any]: cols }}
          >
            {Array.from({ length: cols }).map((__, c) => (
              <Skeleton
                key={`c-${r}-${c}`}
                className={cn(
                  "h-4",
                  c === cols - 1 ? "ml-auto w-8 rounded-md" : "w-4/5"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Section header (title + subtitle) placeholder */
function HeaderSkeleton({
  withBadges = true,
  centered = false,
}: {
  withBadges?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        centered && "text-center sm:items-center sm:justify-center"
      )}
    >
      <div className={cn(centered && "w-full")}>
        <div
          className={cn(
            "flex items-center gap-2",
            centered && "justify-center"
          )}
        >
          {/* Icon blob */}
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-md dark:bg-white/5 dark:border-white/15">
            <div className="size-4 rounded bg-muted/60" />
          </div>
          <Skeleton className="h-7 w-44" />
        </div>
        <Skeleton className="mt-2 h-4 w-80" />
      </div>

      {withBadges && (
        <div
          className={cn(
            "flex items-center gap-2",
            centered && "justify-center"
          )}
        >
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      )}
    </div>
  );
}

/**
 * Main loading component
 *
 * Mirrors:
 *  - MerchantListSection header (title/subtitle + optional badges)
 *  - Explorer/command bar
 *  - Responsive results (mobile cards + desktop table)
 *
 * Use:
 * <ListExplorerTableLoading />
 * or:
 * <ListExplorerTableLoading variant="customer" rows={6} cols={5} />
 */
export default function ListExplorerTableLoading({
  rows = 8,
  cols = 6,
  showExplorer = true,
  withBadges = true,
  variant = "merchant", // 'merchant' | 'customer'
  className,
}: {
  rows?: number;
  cols?: number;
  showExplorer?: boolean;
  withBadges?: boolean;
  variant?: "merchant" | "customer";
  className?: string;
}) {
  const isCustomer = variant === "customer";

  // Width containers to match your sections
  const outer = isCustomer
    ? "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8"
    : "w-full px-5 sm:px-6 lg:px-16 mt-8";

  return (
    <section className={cn(outer, className)} aria-busy aria-live="polite">
      {/* Header */}
      <HeaderSkeleton withBadges={withBadges} centered={isCustomer} />

      {/* Optional divider */}
      <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Explorer */}
      {showExplorer && (
        <div className="mb-4">
          <ExplorerSkeleton />
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          <MobileCardSkeleton />
          <MobileCardSkeleton />
          <MobileCardSkeleton />
        </div>

        {/* Desktop table */}
        <TableSkeleton rows={rows} cols={cols} />
      </div>
    </section>
  );
}
