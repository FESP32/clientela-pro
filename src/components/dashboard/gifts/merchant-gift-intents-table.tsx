// components/dashboard/gifts/gift-intents-table.tsx
"use client";

import * as React from "react";
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
import { MoreHorizontal, ExternalLink, QrCode } from "lucide-react";
import type { GiftIntentRow } from "@/types";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { GiftIntentLinkDialog } from "@/components/dashboard/gifts/gift-intent-link-dialog";
import { fmt } from "@/lib/utils";

function MobileQRButton({
  title,
  viewPath,
  onShowLink,
  className,
}: {
  title: string;
  viewPath: string;
  onShowLink: (title: string, path: string) => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      aria-label={`Show QR for ${title}`}
      aria-haspopup="dialog"
      onClick={() => onShowLink(title, viewPath)}
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

function GiftIntentActionsMenu({
  intentId,
  onShowLink,
  align = "end",
  buttonClassName,
}: {
  intentId: string;
  onShowLink: (title: string, path: string) => void;
  align?: "start" | "end";
  buttonClassName?: string;
}) {
  const viewPath = `/services/gifts/intent/${intentId}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open actions"
          className={buttonClassName}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* View intent (primary) */}
        <DropdownMenuItem
          asChild
          className="text-primary data-[highlighted]:bg-primary/10"
        >
          <Link href={viewPath} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            View intent
          </Link>
        </DropdownMenuItem>

        {/* Show intent URL (amber) */}
        <DropdownMenuItem
          className="flex items-center gap-2 text-amber-600 data-[highlighted]:bg-amber-50 dark:data-[highlighted]:bg-amber-950/30"
          onSelect={() => setTimeout(() => onShowLink(intentId, viewPath), 0)}
        >
          <QrCode className="h-4 w-4" />
          Show intent URL
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function GiftIntentsTable({
  intents,
}: {
  intents: GiftIntentRow[];
}) {
  const [dlg, setDlg] = React.useState<{ title: string; path: string } | null>(
    null
  );

  const emptyState = (
    <div className="rounded-lg border p-6">
      <p className="mb-1 font-medium">No intents yet</p>
      <p className="text-sm text-muted-foreground">
        Use the form above to create a new intent for this gift.
      </p>
    </div>
  );

  const columns: Column<GiftIntentRow>[] = [
    {
      key: "id",
      header: "Intent",
      headClassName: "min-w-[240px]",
      cell: (i) => <div className="font-mono text-xs break-all">{i.id}</div>,
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[120px]",
      cell: (i) => (
        <Badge
          variant={
            i.status === "pending"
              ? "secondary"
              : i.status === "consumed" || i.status === "claimed"
              ? "default"
              : "outline"
          }
        >
          {i.status}
        </Badge>
      ),
    },
    {
      key: "expires_at",
      header: "Expires",
      headClassName: "w-[200px]",
      cell: (i) => (
        <span className="text-xs text-muted-foreground">
          {fmt(i.expires_at)}
        </span>
      ),
    },
    {
      key: "consumed_at",
      header: "Consumed",
      headClassName: "w-[200px]",
      cell: (i) => (
        <span className="text-xs text-muted-foreground">
          {fmt(i.consumed_at)}
        </span>
      ),
    },
    {
      key: "customer_id",
      header: "Customer",
      headClassName: "w-[220px]",
      cell: (i) =>
        i.customer_id ? (
          <Badge variant="outline" className="font-mono text-[10px]">
            {i.customer_id}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[80px] text-right",
      cell: (i) => (
        <div className="text-right">
          <GiftIntentActionsMenu
            intentId={i.id}
            onShowLink={(title, path) => setDlg({ title, path })}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {dlg && (
        <GiftIntentLinkDialog
          open
          onOpenChange={(o) => !o && setDlg(null)}
          intentTitle={dlg.title}
          intentPath={dlg.path}
        />
      )}

      <ResponsiveListTable<GiftIntentRow>
        items={intents}
        getRowKey={(i) => i.id}
        emptyState={emptyState}
        /* Mobile cards */
        renderMobileCard={(i) => {
          const viewPath = `/services/gifts/intent/${i.id}`;
          return (
            <div key={i.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="">
                  <div className="font-mono text-xs break-all">{i.id}</div>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        i.status === "pending"
                          ? "secondary"
                          : i.status === "consumed" || i.status === "claimed"
                          ? "default"
                          : "outline"
                      }
                    >
                      {i.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {fmt(i.created_at)}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    Expires: {fmt(i.expires_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Consumed: {fmt(i.consumed_at)}
                  </div>
                  <div className="text-xs">
                    Customer:{" "}
                    {i.customer_id ? (
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px]"
                      >
                        {i.customer_id}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                {/* Actions (mobile: big QR + kebab) */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <MobileQRButton
                    title={i.id}
                    viewPath={viewPath}
                    onShowLink={(title, path) => setDlg({ title, path })}
                  />
                  <GiftIntentActionsMenu
                    intentId={i.id}
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
