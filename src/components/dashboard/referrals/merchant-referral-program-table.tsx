// components/dashboard/referrals/merchant-referral-programs-table.tsx
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
import { MoreHorizontal, Eye, UserPlus, QrCode, Trash2, ToggleLeft, ToggleRight, ListCheck } from "lucide-react";

import { ReferralJoinLinkDialog } from "@/components/dashboard/referrals/referral-join-link-dialog";
import { fmt } from "@/lib/utils";
import type { ReferralProgramRow } from "@/types";
import { deleteReferralProgram, finishReferralProgram, toggleReferralProgramActive } from "@/actions";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/common/status-badge";

export default function MerchantReferralProgramsTable({
  programs,
}: {
  programs: ReferralProgramRow[];
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  const emptyState = (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          No Referral programs yet.
        </p>
      </CardContent>
    </Card>
  );

  const columns: Column<ReferralProgramRow>[] = [
    {
      key: "title",
      header: "Title",
      headClassName: "w-[26%]",
      cell: (p) => <span className="font-medium">{p.title}</span>,
    },
    {
      key: "code",
      header: "Code",
      headClassName: "w-[14%]",
      cell: (p) => <Badge variant="secondary">{p.code}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[12%]",
      cell: (p) =>
        <StatusBadge status={p.status} endsAt={p.valid_to}/>
    },
    {
      key: "referrer_reward",
      header: "Referrer Reward",
      headClassName: "w-[16%]",
      cell: (p) =>
        p.referrer_reward ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "referred_reward",
      header: "Referred Reward",
      headClassName: "w-[16%]",
      cell: (p) =>
        p.referred_reward ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "created",
      header: "Created",
      headClassName: "w-[16%]",
      cell: (p) => (
        <span className="text-sm text-muted-foreground">
          {fmt(p.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[10%] text-right",
      cell: (p) => {
        const viewPath = `/dashboard/referrals/${p.id}`;
        const joinPath = `/services/referrals/referrer/${p.id}`;
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
                  <Link href={viewPath} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View participants
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href={joinPath} className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Join as referrer
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() =>
                    setTimeout(
                      () => setDlg({ title: p.title, path: joinPath }),
                      0
                    )
                  }
                >
                  <QrCode className="h-4 w-4" />
                  Show join URL
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <form action={deleteReferralProgram}>
                  <input type="hidden" name="id" value={p.id} />
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

                <form action={finishReferralProgram.bind(null, p.id)}>
                  <DropdownMenuItem asChild>
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2 text-red-400 focus:text-red-600"
                    >
                      <ListCheck />
                      Finish
                    </button>
                  </DropdownMenuItem>
                </form>

                <form action={toggleReferralProgramActive.bind(null, p.id)}>
                  <DropdownMenuItem asChild>
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2 text-red-400 focus:text-red-600"
                    >
                      {p.status === "active" ? <ToggleLeft /> : <ToggleRight />}
                      {p.status === "active" ? "Set inactive" : "Set active"}
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
        <ReferralJoinLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          programTitle={dlg.title}
          joinPath={dlg.path}
        />
      )}

      <ResponsiveListTable<ReferralProgramRow>
        items={programs}
        getRowKey={(p) => p.id}
        emptyState={emptyState}
        /* Mobile cards */
        renderMobileCard={(p) => {
          const viewPath = `/dashboard/referrals/${p.id}`;
          const joinPath = `/services/referrals/referrer/${p.id}`;

          return (
            <div key={p.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{p.code}</Badge>
                    {p.status === "active" ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                    <div className="text-muted-foreground">
                      <span className="mr-1">Referrer:</span>
                      <span className="text-foreground">
                        {p.referrer_reward ?? "—"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="mr-1">Referred:</span>
                      <span className="text-foreground">
                        {p.referred_reward ?? "—"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Created {fmt(p.created_at)}
                    </div>
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
                      <Link href={viewPath} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View participants
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={joinPath} className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Join as referrer
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={() =>
                        setTimeout(
                          () => setDlg({ title: p.title, path: joinPath }),
                          0
                        )
                      }
                    >
                      <QrCode className="h-4 w-4" />
                      Show join URL
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <form action={deleteReferralProgram}>
                      <input type="hidden" name="id" value={p.id} />
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
