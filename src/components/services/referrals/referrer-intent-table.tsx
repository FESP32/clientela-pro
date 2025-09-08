// components/services/referrals/intent-list-responsive.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";

function statusVariant(
  s: ReferralIntentListMini["status"]
): "default" | "secondary" | "outline" {
  if (s === "pending") return "secondary";
  if (s === "consumed") return "default";
  return "outline";
}

export default function ReferrerIntentTable({
  intents,
}: {
  intents: ReferralIntentListMini[];
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  const emptyState = (
    <Card className="mx-auto max-w-md">
      <CardContent className="py-10 text-center">
        <p className="text-sm text-muted-foreground">No intents yet.</p>
      </CardContent>
    </Card>
  );

  const columns: Column<ReferralIntentListMini>[] = [
    {
      key: "id",
      header: "Intent ID",
      headClassName: "min-w-[280px]",
      cell: (i) => (
        <div className="font-mono text-xs break-all" title={i.id}>
          {i.id}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[120px]",
      cell: (i) => <Badge variant={statusVariant(i.status)}>{i.status}</Badge>,
    },
    {
      key: "created",
      header: "Created",
      headClassName: "w-[180px]",
      cell: (i) => format(new Date(i.created_at), "PPp"),
    },
    {
      key: "expires",
      header: "Expires",
      headClassName: "w-[180px]",
      cell: (i) => (i.expires_at ? format(new Date(i.expires_at), "PPp") : "—"),
    },
    {
      key: "assigned",
      header: "Assigned",
      headClassName: "w-[120px]",
      cell: (i) => (i.referred_id ? "Yes" : "No"),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[120px] text-right",
      cell: (i) => {
        const referredPath = `/services/referrals/referred/${i.id}`;
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
                  <Link href={referredPath} className="flex items-center gap-2">
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
        <ReferralIntentLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          intentTitle={dlg.title}
          intentPath={dlg.path}
        />
      )}

      <ResponsiveListTable<ReferralIntentListMini>
        items={intents}
        getRowKey={(i) => i.id}
        emptyState={emptyState}
        /* Mobile: card renderer */
        renderMobileCard={(i) => {
          const referredPath = `/services/referrals/referred/${i.id}`;
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
                    <Badge variant={statusVariant(i.status)}>{i.status}</Badge>
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
