// components/dashboard/referrals/referral-participants-table.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/utils";
import type { ReferralParticipantListItem } from "@/types";

import ResponsiveListTable, {
  type Column,
} from "@/components/dashboard/common/responsive-list-table";

export default function ReferralParticipantsTable({
  items,
}: {
  items: ReferralParticipantListItem[];
}) {
  const emptyState = (
    <div className="rounded-lg border p-6">
      <p className="font-medium mb-1">No participants yet</p>
      <p className="text-sm text-muted-foreground">
        Share your program code or invite customers to join.
      </p>
    </div>
  );

  const columns: Column<ReferralParticipantListItem>[] = [
    {
      key: "customer",
      header: "Customer",
      headClassName: "w-[28%]",
      cell: (row) =>
        row.customer_name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "referred",
      header: "Referred Count",
      headClassName: "w-[12%]",
      cell: (row) => <Badge variant="secondary">{row.referred_qty}</Badge>,
    },
    {
      key: "note",
      header: "Note",
      headClassName: "w-[30%]",
      cell: (row) => (
        <span className="text-sm">
          {row.note ?? <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      headClassName: "w-[14%]",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {fmt(row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <ResponsiveListTable<ReferralParticipantListItem>
      items={items}
      getRowKey={(row) => row.id}
      emptyState={emptyState}
      /* Mobile cards */
      renderMobileCard={(row) => (
        <div key={row.id} className="rounded-lg border bg-card p-4">
          <div className="font-medium truncate">
            {row.customer_name ?? (
              <span className="text-muted-foreground">—</span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{row.referred_qty} referred</Badge>
          </div>

          <div className="mt-2 text-sm">
            {row.note ? (
              <p className="line-clamp-2">{row.note}</p>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Joined {fmt(row.created_at)}
          </div>
        </div>
      )}
      /* Desktop columns */
      columns={columns}
    />
  );
}
