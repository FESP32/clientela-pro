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
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  QrCode,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ListCheck,
} from "lucide-react";

import { ReferralJoinLinkDialog } from "@/components/dashboard/referrals/referral-join-link-dialog";
import { fmt } from "@/lib/utils";
import type { ReferralProgramRow } from "@/types";
import {
  deleteReferralProgram,
  finishReferralProgram,
  toggleReferralProgramActive,
} from "@/actions";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/common/status-badge";

/* -------------------------------------------
 * Mobile-only, thumb-friendly QR button
 * ------------------------------------------- */
function MobileQRButton({
  title,
  joinPath,
  onShowLink,
  className,
}: {
  title: string;
  joinPath: string;
  onShowLink: (title: string, path: string) => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      aria-label={`Show QR for ${title}`}
      aria-haspopup="dialog"
      onClick={() => onShowLink(title, joinPath)}
      variant="secondary"
      className={`md:hidden h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
        className ?? ""
      }`}
    >
      <QrCode className="h-5 w-5 mr-2" />
      Show QR
    </Button>
  );
}

/* -------------------------------------------
 * Reusable actions menu (desktop + mobile)
 * ------------------------------------------- */
type ReferralProgramActionsMenuProps = {
  program: ReferralProgramRow;
  onShowLink: (title: string, path: string) => void;
  align?: "start" | "end";
  buttonClassName?: string;
};

function ReferralProgramActionsMenu({
  program,
  onShowLink,
  align = "end",
  buttonClassName,
}: ReferralProgramActionsMenuProps) {
  const viewPath = `/dashboard/referrals/${program.id}`;
  const joinPath = `/services/referrals/referrer/${program.id}`;
  const isActive = program.status === "active";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${program.title}`}
          className={buttonClassName}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* View participants (primary) */}
        <DropdownMenuItem
          asChild
          className="text-primary data-[highlighted]:bg-primary/10"
        >
          <Link href={viewPath} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View participants
          </Link>
        </DropdownMenuItem>

        {/* Join as referrer (emerald) */}
        <DropdownMenuItem
          asChild
          className="text-emerald-600 data-[highlighted]:bg-emerald-50 dark:data-[highlighted]:bg-emerald-950/30"
        >
          <Link href={joinPath} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Join as referrer
          </Link>
        </DropdownMenuItem>

        {/* Show join URL (amber) */}
        <DropdownMenuItem
          className="flex items-center gap-2 text-amber-600 data-[highlighted]:bg-amber-50 dark:data-[highlighted]:bg-amber-950/30"
          onSelect={() =>
            setTimeout(() => onShowLink(program.title, joinPath), 0)
          }
        >
          <QrCode className="h-4 w-4" />
          Show join URL
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Finish (violet) */}
        <form action={finishReferralProgram.bind(null, program.id)}>
          <DropdownMenuItem
            asChild
            className="text-violet-600 data-[highlighted]:bg-violet-50 dark:data-[highlighted]:bg-violet-950/30"
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              <ListCheck className="h-4 w-4" />
              Finish
            </button>
          </DropdownMenuItem>
        </form>

        {/* Toggle Active/Inactive (green when activating, zinc when deactivating) */}
        <form action={toggleReferralProgramActive.bind(null, program.id)}>
          <DropdownMenuItem
            asChild
            className={
              isActive
                ? "text-zinc-700 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-900"
                : "text-green-600 data-[highlighted]:bg-green-50 dark:data-[highlighted]:bg-green-950/30"
            }
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              {isActive ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}
              {isActive ? "Set inactive" : "Set active"}
            </button>
          </DropdownMenuItem>
        </form>

        {/* Delete (destructive) */}
        <form action={deleteReferralProgram}>
          <input type="hidden" name="id" value={program.id} />
          <DropdownMenuItem
            asChild
            className="text-red-600 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/30"
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------
 * Main table
 * ------------------------------------------- */
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
      cell: (p) => <StatusBadge status={p.status} endsAt={p.valid_to} />,
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
      cell: (p) => (
        <div className="text-right">
          <ReferralProgramActionsMenu
            program={p}
            onShowLink={(title, path) => setDlg({ title, path })}
          />
        </div>
      ),
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

                {/* Actions (mobile gets big QR + kebab) */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <MobileQRButton
                    title={p.title}
                    joinPath={joinPath}
                    onShowLink={(title, path) => setDlg({ title, path })}
                  />
                  <ReferralProgramActionsMenu
                    program={p}
                    onShowLink={(title, path) => setDlg({ title, path })}
                    align="end"
                    buttonClassName="shrink-0"
                  />
                </div>
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
