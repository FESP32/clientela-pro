// components/dashboard/stamps/stamp-cards-table.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Settings2,
  Trash2,
  ExternalLink,
  QrCode,
  Stamp,
} from "lucide-react";

import { StampJoinLinkDialog } from "@/components/dashboard/stamps/stamp-join-link-dialog";
import { fmt } from "@/lib/utils";
import type { StampCardListItem } from "@/types";

import ResponsiveListTable, {
  type Column,
} from "@/components/dashboard/common/responsive-list-table";
import { Card, CardContent } from "@/components/ui/card";

export default function MerchantStampCardsTable({
  cards,
  deleteStampCard,
}: {
  cards: StampCardListItem[];
  deleteStampCard(formData: FormData): Promise<void>;
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  const emptyState = (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">No stamp cards yet.</p>
      </CardContent>
    </Card>
  );

  const columns: Column<StampCardListItem>[] = [
    {
      key: "title",
      header: "Title",
      headClassName: "w-[26%]",
      cell: (c) => <span className="font-medium">{c.title}</span>,
    },
    {
      key: "goal",
      header: "Goal",
      headClassName: "w-[26%]",
      cell: (c) => (
        <span className="text-sm text-muted-foreground">{c.goal_text}</span>
      ),
    },
    {
      key: "stamps",
      header: "Stamps",
      headClassName: "w-[10%]",
      cell: (c) => <Badge variant="secondary">{c.stamps_required}</Badge>,
    },
    {
      key: "products",
      header: "Products",
      headClassName: "w-[10%]",
      cell: (c) => <Badge variant="outline">{c.product_count ?? 0}</Badge>,
    },
    {
      key: "validity",
      header: "Validity",
      headClassName: "w-[16%]",
      cell: (c) => (
        <span className="text-sm text-muted-foreground">
          {fmt(c.valid_from)} — {fmt(c.valid_to)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[8%]",
      cell: (c) =>
        c.is_active ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[10%] text-right",
      cell: (c) => {
        const joinPath = `/services/stamps/${c.id}/join`;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                  <Link href={joinPath} className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open join page
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() =>
                    setTimeout(
                      () => setDlg({ title: c.title, path: joinPath }),
                      0
                    )
                  }
                >
                  <QrCode className="h-4 w-4" />
                  Show join URL
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/stamps/${c.id}`}
                    className="flex items-center gap-2"
                  >
                    <Stamp className="size-4"/>
                    Create Stamp Punch
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <form action={deleteStampCard}>
                  <input type="hidden" name="cardId" value={c.id} />
                  <DropdownMenuItem asChild>
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {dlg && (
        <StampJoinLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          cardTitle={dlg.title}
          joinPath={dlg.path}
        />
      )}

      <ResponsiveListTable<StampCardListItem>
        items={cards}
        getRowKey={(c) => c.id}
        emptyState={emptyState}
        /* Mobile cards */
        renderMobileCard={(c) => {
          const joinPath = `/services/stamps/${c.id}/join`;
          return (
            <div key={c.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {c.goal_text}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {c.stamps_required} stamps
                    </Badge>
                    <Badge variant="outline">
                      {c.product_count ?? 0} products
                    </Badge>
                    {c.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {fmt(c.valid_from)} — {fmt(c.valid_to)}
                  </div>
                </div>

                {/* Actions */}
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
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                      <Link href={joinPath} className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open join page
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={() =>
                        setTimeout(
                          () => setDlg({ title: c.title, path: joinPath }),
                          0
                        )
                      }
                    >
                      <QrCode className="h-4 w-4" />
                      Show join URL
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/stamps/${c.id}`}
                        className="flex items-center gap-2"
                      >
                        <Stamp className="size-4" />
                        Create Stamp Punch
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <form action={deleteStampCard}>
                      <input type="hidden" name="cardId" value={c.id} />
                      <DropdownMenuItem asChild>
                        <button
                          type="submit"
                          className="w-full text-left flex items-center gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        }}
        /* Desktop columns */
        columns={columns}
      />
    </>
  );
}
