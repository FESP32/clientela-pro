"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, QrCode } from "lucide-react";
import { ReferralIntentLinkDialog } from "@/components/services/referrals/referral-intent-link-dialog";
import type { ReferralIntentListMini } from "@/types";

export function IntentListTable({
  intents,
}: {
  intents: ReferralIntentListMini[];
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  return (
    <>
      {/* Controlled dialog rendered outside dropdown to avoid unmount issues */}
      {dlg && (
        <ReferralIntentLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          intentTitle={dlg.title}
          intentPath={dlg.path}
        />
      )}

      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {intents.map((i) => {
          const referredPath = `/services/referrals/referred/${i.id}`;
          const statusVariant =
            i.status === "pending"
              ? "secondary"
              : i.status === "consumed"
              ? "default"
              : "outline";

          return (
            <div
              key={`m-${i.id}`}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* ID + status */}
                  <div className="flex items-center gap-2">
                    <div className="truncate font-mono text-xs" title={i.id}>
                      {i.id}
                    </div>
                    <Badge variant={statusVariant}>{i.status}</Badge>
                  </div>

                  {/* Dates */}
                  <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                    <div>
                      <span className="mr-1">Created:</span>
                      {format(new Date(i.created_at), "PPp")}
                    </div>
                    <div>
                      <span className="mr-1">Expires:</span>
                      {i.expires_at
                        ? format(new Date(i.expires_at), "PPp")
                        : "—"}
                    </div>
                  </div>

                  {/* Assigned */}
                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground mr-1">
                      Assigned:
                    </span>
                    {i.referred_id ? "Yes" : "No"}
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
                      <Link
                        href={referredPath}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open as referred
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={() =>
                        setTimeout(
                          () => setDlg({ title: i.id, path: referredPath }),
                          0
                        )
                      }
                    >
                      <QrCode className="h-4 w-4" />
                      Show link
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    {/* Room for more actions (Copy ID, Cancel, etc.) */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Intent ID</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[18%]">Created</TableHead>
              <TableHead className="w-[18%]">Expires</TableHead>
              <TableHead className="w-[10%]">Assigned</TableHead>
              <TableHead className="w-[12%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intents.map((i) => {
              const referredPath = `/services/referrals/referred/${i.id}`;
              const statusVariant =
                i.status === "pending"
                  ? "secondary"
                  : i.status === "consumed"
                  ? "default"
                  : "outline";

              return (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs break-all">
                    {i.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant}>{i.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(i.created_at), "PPp")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {i.expires_at ? format(new Date(i.expires_at), "PPp") : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {i.referred_id ? "Yes" : "No"}
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
                            href={referredPath}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open as referred
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onSelect={() =>
                            setTimeout(
                              () => setDlg({ title: i.id, path: referredPath }),
                              0
                            )
                          }
                        >
                          <QrCode className="h-4 w-4" />
                          Show link
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        {/* room for more actions */}
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
