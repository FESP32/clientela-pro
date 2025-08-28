"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";
import { StampJoinLinkDialog } from "@/components/dashboard/stamps/stamp-join-link-dialog";
import { fmt } from "@/lib/utils";
import type { StampCardListItem } from "@/types";

export function StampCardsTable({
  cards,
  deleteStampCard,
}: {
  cards: StampCardListItem[];
  deleteStampCard: (id: string) => Promise<void>;
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  return (
    <>
      {dlg && (
        <StampJoinLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          cardTitle={dlg.title}
          joinPath={dlg.path}
          // modal={false}
        />
      )}

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {cards.map((c) => {
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

                {/* Actions dropdown */}
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
                        <Settings2 className="h-4 w-4" />
                        Manage intents
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <form action={deleteStampCard.bind(null, c.id)}>
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
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[26%]">Title</TableHead>
              <TableHead className="w-[26%]">Goal</TableHead>
              <TableHead className="w-[10%]">Stamps</TableHead>
              <TableHead className="w-[10%]">Products</TableHead>
              <TableHead className="w-[16%]">Validity</TableHead>
              <TableHead className="w-[8%]">Status</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((c) => {
              const joinPath = `/services/stamps/${c.id}/join`;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.goal_text}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.stamps_required}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.product_count ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmt(c.valid_from)} — {fmt(c.valid_to)}
                  </TableCell>
                  <TableCell>
                    {c.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Open actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                          <Link
                            href={joinPath}
                            className="flex items-center gap-2"
                          >
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

                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/stamps/${c.id}`}
                            className="flex items-center gap-2"
                          >
                            <Settings2 className="h-4 w-4" />
                            Manage intents
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <form action={deleteStampCard.bind(null, c.id)}>
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
