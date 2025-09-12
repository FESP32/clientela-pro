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
import { Card, CardContent } from "@/components/ui/card";
import { GiftIntentLinkDialog } from "@/components/dashboard/gifts/gift-intent-link-dialog";
import { fmt } from "@/lib/utils";


export default function GiftIntentsTable({
  intents,
}: {
  intents: GiftIntentRow[];
}) {
  const [dlg, setDlg] = React.useState<{ title: string; path: string } | null>(
    null
  );

  const emptyState = (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          No gift intents yet.
        </p>
      </CardContent>
    </Card>
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
      cell: (i) => {
        const viewPath = `/services/gifts/intent/${i.id}`;
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
                    <ExternalLink className="h-4 w-4" />
                    View intent
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() =>
                    setTimeout(() => setDlg({ title: i.id, path: viewPath }), 0)
                  }
                >
                  <QrCode className="h-4 w-4" />
                  Show intent URL
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
        renderMobileCard={(i) => {
          const viewPath = `/services/gifts/intent/${i.id}`;
          return (
            <div key={i.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
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
                        <ExternalLink className="h-4 w-4" />
                        View intent
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={() =>
                        setTimeout(
                          () => setDlg({ title: i.id, path: viewPath }),
                          0
                        )
                      }
                    >
                      <QrCode className="h-4 w-4" />
                      Show intent URL
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        }}
        columns={columns}
      />
    </>
  );
}
