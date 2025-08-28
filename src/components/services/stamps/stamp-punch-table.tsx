// components/services/stamps/stamp-punches-table.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Building2, MoreHorizontal, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { PunchesGroupedByCard } from "@/types/stamps";
import { fmt } from "@/lib/utils";

export default function StampPunchesTable({
  items,
}: {
  items: PunchesGroupedByCard[];
}) {
  return (
    <Card className="mx-auto max-w-6xl">
      <CardHeader>
        <CardTitle>My Stamp Cards</CardTitle>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No punches yet. Join a stamp card and start collecting!
          </p>
        ) : (
          <>
            {/* ───────────────── Mobile: stamp-card tickets ───────────────── */}
            <div className="space-y-3 md:hidden">
              {items.map((g) => {
                const business = g.business;
                const initial = (business?.name?.[0] || "?").toUpperCase();
                const cardHref = `/services/stamps/${g.card.id}`;
                const businessHref = business ? `/dashboard/businesses/${business.id}` : "#";

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
                        {business?.image_url ? (
                          <Image
                            src={business.image_url}
                            alt={`${business.name ?? "Business"} logo`}
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
                          {business?.name ?? "—"}
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

                            <DropdownMenuItem asChild disabled={!business}>
                              <Link href={businessHref} className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                View business
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-4">
                      {/* Stamp grid */}
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
              })}
            </div>

            {/* ───────────────── Desktop: table ───────────────── */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[240px]">Card</TableHead>
                    <TableHead className="min-w-[240px]">Business</TableHead>
                    <TableHead className="min-w-[260px]">Progress</TableHead>
                    <TableHead className="w-[140px]">Punches</TableHead>
                    <TableHead className="w-[200px]">Last activity</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((g) => {
                    const business = g.business;
                    const initial = (business?.name?.[0] || "?").toUpperCase();
                    const cardHref = `/services/stamps/${g.card.id}`;
                    const businessHref = business ? `/dashboard/businesses/${business.id}` : "#";
                    const total = g.card.stamps_required;
                    const have = Math.min(g.total_qty, total);
                    const pct = g.pct;

                    return (
                      <TableRow key={g.card.id} className="align-top">
                        {/* Card */}
                        <TableCell className="font-medium">
                          <Link href={cardHref} className="hover:underline">
                            {g.card.title}
                          </Link>
                        </TableCell>

                        {/* Business (with logo) */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="relative h-8 w-8 overflow-hidden rounded bg-muted shrink-0">
                              {business?.image_url ? (
                                <Image
                                  src={business.image_url}
                                  alt={`${business.name ?? "Business"} logo`}
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
                            <span className="text-sm text-foreground">
                              {business?.name ?? "—"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Progress */}
                        <TableCell className="min-w-[260px]">
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
                        </TableCell>

                        {/* Punches (count) */}
                        <TableCell>
                          <Badge variant="secondary">{g.total_qty}</Badge>
                        </TableCell>

                        {/* Last activity */}
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {fmt(g.last_at)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
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

                              <DropdownMenuItem asChild disabled={!business}>
                                <Link href={businessHref} className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  View business
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────
   StampGrid: renders filled/empty stamp "dots" like a card
   - mobile: bigger dots
   - desktop (small): smaller dots for inline display
────────────────────────────────────────────────────────── */
function StampGrid({ total, have, small = false }: { total: number; have: number; small?: boolean }) {
  // Use flex-wrap for responsive rows without dynamic Tailwind col classes
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
              <Check className={`${text}`} />
            ) : (
              <span className={`${text}`}>{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
