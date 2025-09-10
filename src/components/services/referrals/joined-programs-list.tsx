// components/customer/referrals/joined-referral-programs-list.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { Gift, Ticket, UserPlus } from "lucide-react";
import StatusBadge from "@/components/common/status-badge";

type Row = {
  id: string;
  title: string;
  code: string;
  status: string;
  referrer_reward: string | null;
  referred_reward: string | null;
  valid_from: string | null;
  valid_to: string | null;
  joined_at: string;
};

export default function JoinedReferralProgramsList({
  items,
}: {
  items: Row[];
}) {
  const emptyState = (
    <Card className="mx-auto max-w-md">
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          You haven’t joined any programs yet.
        </p>
      </CardContent>
    </Card>
  );

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Program",
      headClassName: "min-w-[260px]",
      cell: (p) => (
        <div className="font-medium">
          {p.title}
          <div className="mt-1 flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="font-mono">
              {p.code}
            </Badge>
            {<StatusBadge status={p.status} endsAt={p.valid_to}/>}
          </div>
        </div>
      ),
    },
    {
      key: "referrer_reward",
      header: "Referrer Reward",
      headClassName: "min-w-[180px]",
      cell: (p) =>
        p.referrer_reward ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "referred_reward",
      header: "Referred Reward",
      headClassName: "min-w-[180px]",
      cell: (p) =>
        p.referred_reward ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "joined_at",
      header: "Joined",
      headClassName: "w-[200px]",
      cell: (p) => new Date(p.joined_at).toLocaleString(),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[80px] text-right",
      cell: (p) => (
        <div className="text-right">
          <Button asChild size="sm" variant="outline">
            <Link href={`/services/referrals/referrer/${p.id}`}>View</Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <ResponsiveListTable<Row>
      items={items}
      getRowKey={(p) => p.id}
      emptyState={emptyState}
      /* Mobile: stacked cards */
      renderMobileCard={(p) => (
        <div key={p.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium truncate">{p.title}</div>
              {p.status ? (
                <Badge>Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono">
                {p.code}
              </Badge>
            </div>

            <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="text-foreground">Referrer:</span>
                <span>{p.referrer_reward ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span className="text-foreground">Referred:</span>
                <span>{p.referred_reward ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 opacity-70" />
                <span>Joined {new Date(p.joined_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-3">
              <Button asChild size="sm" variant="outline">
                <Link href={`/services/referrals/referrer/${p.id}`}>View</Link>
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
