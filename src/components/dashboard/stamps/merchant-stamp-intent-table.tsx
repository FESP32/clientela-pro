"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/utils";
import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { StampIntentListItem } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, QrCode } from "lucide-react";
import { IntentLinkDialog } from "@/components/dashboard/stamps/intent-link-dialog";

function MobileQRButton({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        aria-label="Show QR"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        variant="secondary"
        className={`md:hidden h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
          className ?? ""
        }`}
      >
        <QrCode className="h-5 w-5 mr-2" />
        Show QR
      </Button>

      {open && (
        <IntentLinkDialog
          open={open}
          onOpenChange={setOpen}
          href={href}
          title="Scan to open"
        />
      )}
    </>
  );
}

function IntentActionsMenu({ href }: { href: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {open && (
        <IntentLinkDialog
          open={open}
          onOpenChange={(o) => setOpen(o)}
          href={href}
          title={"Scan to open"}
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            asChild
            className="text-primary data-[highlighted]:bg-primary/10"
          >
            <Link href={href} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex items-center gap-2 text-amber-600 data-[highlighted]:bg-amber-50 dark:data-[highlighted]:bg-amber-950/30"
            onSelect={() => setTimeout(() => setOpen(true), 0)}
          >
            <QrCode className="h-4 w-4" />
            Show QR
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default function StampIntentsTable({
  intents,
}: {
  intents: StampIntentListItem[];
}) {
  const emptyState = (
    <div className="rounded-lg border p-6">
      <p className="mb-1 font-medium">No intents yet</p>
      <p className="text-sm text-muted-foreground">
        Use the form above to create a new intent for this card.
      </p>
    </div>
  );

  const StatusBadge = ({
    status,
  }: {
    status: StampIntentListItem["status"];
  }) => {
    if (status === "pending") return <Badge>Pending</Badge>;
    if (status === "consumed")
      return <Badge variant="secondary">Consumed</Badge>;
    return <Badge variant="outline">Canceled</Badge>;
  };

  const columns: Column<StampIntentListItem>[] = [
    {
      key: "created",
      header: "Created",
      headClassName: "w-[12%]",
      cell: (i) => (
        <span className="text-sm text-muted-foreground">
          {fmt(i.created_at)}
        </span>
      ),
    },
    {
      key: "qty",
      header: "Qty",
      headClassName: "w-[10%]",
      cell: (i) => <Badge variant="secondary">{i.qty}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[12%]",
      cell: (i) => <StatusBadge status={i.status} />,
    },
    {
      key: "customer",
      header: "Customer",
      headClassName: "w-[18%]",
      cell: (i) =>
        i.customer_name ? (
          i.customer_name
        ) : i.customer_id ? (
          i.customer_id
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "expires",
      header: "Expires",
      headClassName: "w-[18%]",
      cell: (i) => (
        <span className="text-sm text-muted-foreground">
          {fmt(i.expires_at)}
        </span>
      ),
    },
    {
      key: "consumed",
      header: "Consumed",
      headClassName: "w-[18%]",
      cell: (i) => (
        <span className="text-sm text-muted-foreground">
          {fmt(i.consumed_at)}
        </span>
      ),
    },
    {
      key: "note",
      header: "Note",
      headClassName: "w-[12%]",
      cell: (i) => (
        <span className="max-w-[14rem] truncate text-sm">
          {i.note ?? <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[10%] text-right",
      cell: (i) => (
        <div className="text-right">
          <IntentActionsMenu href={`/services/stamps/intents/${i.id}`} />
        </div>
      ),
    },
  ];

  return (
    <ResponsiveListTable<StampIntentListItem>
      items={intents}
      getRowKey={(i) => i.id}
      emptyState={emptyState}
      renderMobileCard={(i) => (
        <div key={i.id} className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{i.qty}</Badge>
                <span className="text-xs text-muted-foreground">
                  {fmt(i.created_at)}
                </span>
              </div>

              <div className="mt-2">{<StatusBadge status={i.status} />}</div>

              <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                <div className="text-muted-foreground">
                  <span className="mr-1">Customer:</span>
                  <span className="text-foreground">
                    {i.customer_name ?? i.customer_id ?? "—"}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  <span className="mr-1">Expires:</span>
                  <span className="text-foreground">{fmt(i.expires_at)}</span>
                </div>
                <div className="text-muted-foreground">
                  <span className="mr-1">Consumed:</span>
                  <span className="text-foreground">{fmt(i.consumed_at)}</span>
                </div>
                <div className="text-muted-foreground">
                  <span className="mr-1">Note:</span>
                  <span className="text-foreground">{i.note ?? "—"}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-2">
              <MobileQRButton href={`/services/stamps/intents/${i.id}`} />
              <IntentActionsMenu href={`/services/stamps/intents/${i.id}`} />
            </div>
          </div>
        </div>
      )}
      columns={columns}
    />
  );
}
