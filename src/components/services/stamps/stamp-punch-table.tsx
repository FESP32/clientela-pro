// components/services/stamps/stamp-punches-responsive.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { PunchesGroupedByCard } from "@/types/stamps";
import { fmt } from "@/lib/utils";

import ResponsiveListTable, {
  type Column,
} from "@/components/dashboard/common/responsive-list-table";

export default function StampPunchesResponsive({
  items,
}: {
  items: PunchesGroupedByCard[];
}) {
  const emptyState = (
    <Card className="mx-auto max-w-md">
      <CardContent className="py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No punches yet. Join a stamp card and start collecting!
        </p>
      </CardContent>
    </Card>
  );

  const columns: Column<PunchesGroupedByCard>[] = [
    {
      key: "card",
      header: "Card",
      headClassName: "min-w-[180px]",
      cell: (g) => (
        <div className="min-w-0">
          <Link
            href={`/services/stamps/${g.card.id}`}
            className="font-medium hover:underline"
          >
            {g.card.title}
          </Link>
          <div className="text-xs text-muted-foreground">
            {g.card.stamps_required} stamps required
          </div>
        </div>
      ),
    },
    {
      key: "business",
      header: "Business",
      headClassName: "min-w-[180px]",
      cell: (g) => {
        const b = g.business;
        const initial = (b?.name?.[0] ?? "?").toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded bg-muted shrink-0">
              {b?.image_url ? (
                <Image
                  src={b.image_url}
                  alt={`${b.name ?? "Business"} logo`}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  {initial}
                </span>
              )}
            </div>
            <span className="text-sm">{b?.name ?? "—"}</span>
          </div>
        );
      },
    },
    {
      key: "progress",
      header: "Progress",
      headClassName: "min-w-[260px]",
      cell: (g) => {
        const total = g.card.stamps_required;
        const have = Math.min(g.total_qty, total);
        const pct = g.pct;
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <StampGrid total={total} have={have} small />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {have}/{total}
                </span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <Progress value={pct} />
            </div>
          </div>
        );
      },
    },
    {
      key: "punches",
      header: "Punches",
      headClassName: "w-[120px]",
      cell: (g) => <Badge variant="secondary">{g.total_qty}</Badge>,
    },
    {
      key: "last",
      header: "Last activity",
      headClassName: "w-[200px]",
      cell: (g) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {fmt(g.last_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[80px] text-right",
      cell: (g) => {
        const cardHref = `/services/stamps/${g.card.id}`;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={cardHref} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View card
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <ResponsiveListTable<PunchesGroupedByCard>
      items={items}
      getRowKey={(g) => g.card.id}
      emptyState={emptyState}
      /* Mobile tickets */
      renderMobileCard={(g) => {
        const b = g.business;
        const initial = (b?.name?.[0] ?? "?").toUpperCase();
        const cardHref = `/services/stamps/${g.card.id}`;
        const total = g.card.stamps_required;
        const have = Math.min(g.total_qty, total);
        const pct = g.pct;

        return (
          <div
            key={g.card.id}
            className="relative overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            {/* Ticket notches */}
            <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2">
              <div className="h-6 w-6 -translate-x-1/2 rounded-full border bg-background" />
            </div>
            <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
              <div className="h-6 w-6 translate-x-1/2 rounded-full border bg-background" />
            </div>

            {/* Header strip */}
            <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
              <div className="relative h-8 w-8 overflow-hidden rounded bg-muted shrink-0">
                {b?.image_url ? (
                  <Image
                    src={b.image_url}
                    alt={`${b.name ?? "Business"} logo`}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    {initial}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {b?.name ?? "—"}
                </div>
                <Link
                  href={cardHref}
                  className="block truncate text-xs text-blue-600 hover:underline"
                >
                  {g.card.title}
                </Link>
              </div>

              {/* Actions */}
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open actions"
                      className="shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={cardHref} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View card
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-4">
              {/* Stamps */}
              <div className="mb-3">
                <StampGrid total={total} have={have} />
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="tabular-nums">
                    {have}/{total} ({pct}%)
                  </span>
                </div>
                <Progress value={pct} />
              </div>

              {/* Footer meta */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Punches {g.total_qty}</Badge>
                <span className="text-xs text-muted-foreground">
                  Last activity {fmt(g.last_at)}
                </span>
              </div>
            </div>
          </div>
        );
      }}
      /* Desktop columns */
      columns={columns}
    />
  );
}

/* ──────────────────────────────────────────────────────────
   StampGrid: renders filled/empty stamp "dots" like a card
────────────────────────────────────────────────────────── */
function StampGrid({
  total,
  have,
  small = false,
}: {
  total: number;
  have: number;
  small?: boolean;
}) {
  const size = small ? "h-6 w-6" : "h-8 w-8";
  const text = small ? "text-[10px]" : "text-[11px]";
  const gap = small ? "gap-1.5" : "gap-2";

  return (
    <div className={`flex flex-wrap ${gap}`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < have;
        return (
          <div
            key={i}
            className={[
              "relative inline-flex items-center justify-center rounded-full border",
              size,
              filled
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground/70 border-dashed",
            ].join(" ")}
            aria-label={filled ? "Stamp collected" : "Stamp empty"}
          >
            {filled ? (
              <Check className={text} />
            ) : (
              <span className={text}>{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
