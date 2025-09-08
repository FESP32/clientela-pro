// components/customer/referrals/referred-intents-responsive.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { format } from "date-fns";
import type { ReferredIntentRow } from "@/actions";
import { BadgePercent, CalendarClock, Ticket } from "lucide-react";

function fmt(ts?: string | null) {
  if (!ts) return "—";
  try {
    return format(new Date(ts), "PPp");
  } catch {
    return ts;
  }
}

export default function ReferredIntentsTable({
  items,
}: {
  items: ReferredIntentRow[];
}) {
  const emptyState = (
    <Card className="mx-auto max-w-md">
      <CardContent className="py-10 text-center">
        <p className="text-sm text-muted-foreground">
          You haven’t joined any invites yet.
        </p>
      </CardContent>
    </Card>
  );

  const columns: Column<ReferredIntentRow>[] = [
    {
      key: "program",
      header: "Program",
      headClassName: "min-w-[220px]",
      cell: (i) => (
        <div className="min-w-0">
          <div className="font-medium truncate">
            {i.referral_program?.title ?? "Referral Program"}
          </div>
          <div className="text-xs text-muted-foreground break-all">
            {i.program_id ?? "—"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[120px]",
      cell: (i) => {
        const variant =
          i.status === "pending"
            ? "secondary"
            : i.status === "consumed"
            ? "default"
            : "outline";
        return <Badge variant={variant}>{i.status}</Badge>;
      },
    },
    {
      key: "joined",
      header: "Joined",
      headClassName: "w-[180px]",
      cell: (i) => fmt(i.consumed_at),
    },
    {
      key: "created",
      header: "Created",
      headClassName: "w-[180px]",
      cell: (i) => fmt(i.created_at),
    },
    {
      key: "expires",
      header: "Expires",
      headClassName: "w-[160px]",
      cell: (i) => fmt(i.expires_at),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[120px] text-right",
      cell: (i) => (
        <div className="text-right">
          <div className="inline-flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/services/referrals/referred/${i.id}`}>Open</Link>
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <ResponsiveListTable<ReferredIntentRow>
      items={items}
      getRowKey={(i) => i.id}
      emptyState={emptyState}
      /* Mobile cards */
      renderMobileCard={(i) => (
        <div key={i.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium truncate">
                {i.referral_program?.title ?? "Referral Program"}
              </div>
              {(() => {
                const variant =
                  i.status === "pending"
                    ? "secondary"
                    : i.status === "consumed"
                    ? "default"
                    : "outline";
                return <Badge variant={variant}>{i.status}</Badge>;
              })()}
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground break-all">
              <BadgePercent className="h-3.5 w-3.5" />
              {i.program_id ?? "—"}
            </div>

            <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                <span>
                  Joined:{" "}
                  <span className="text-foreground">{fmt(i.consumed_at)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                <span>
                  Created:{" "}
                  <span className="text-foreground">{fmt(i.created_at)}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 opacity-80" />
                <span>
                  Expires:{" "}
                  <span className="text-foreground">{fmt(i.expires_at)}</span>
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/services/referrals/referred/${i.id}`}>Open</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
      /* Desktop columns */
      columns={columns}
    />
  );
}
