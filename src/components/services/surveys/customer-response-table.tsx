// components/customer/responses/customer-my-responses-table.tsx
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import ResponsiveListTable, {
  type Column,
} from "@/components/dashboard/common/responsive-list-table";
import { Card, CardContent } from "@/components/ui/card";
import { fmt } from "@/lib/utils";

export type CustomerResponseItem = {
  id: string;
  survey?: { title?: string | null } | null;
  rating?: number | null;
  selected_traits?: string[] | null;
  comment?: string | null;
  submitted_at?: string | null;
};

export default function CustomerResponsesTable({
  items,
}: {
  items: CustomerResponseItem[];
}) {
  const emptyState = (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          You haven’t submitted any responses yet.
        </p>
      </CardContent>
    </Card>
  );

  const columns: Column<CustomerResponseItem>[] = [
    {
      key: "survey",
      header: "Survey",
      headClassName: "min-w-[240px]",
      cell: (r) => (
        <span className="font-medium">
          {r.survey?.title ?? "Untitled survey"}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      headClassName: "w-[120px]",
      cell: (r) => <Badge variant="secondary">{r.rating ?? "—"} / 5</Badge>,
    },
    {
      key: "traits",
      header: "Selected Traits",
      cell: (r) => (
        <div className="flex max-w-[360px] flex-wrap gap-1">
          {(r.selected_traits ?? []).map((t, i) => (
            <Badge key={`${r.id}-trait-${i}`} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "comment",
      header: "Comment",
      cell: (r) => <p className="max-w-[480px] truncate">{r.comment ?? "—"}</p>,
    },
    {
      key: "submitted",
      header: "Submitted",
      headClassName: "w-[220px]",
      cell: (r) => fmt(r.submitted_at),
    },
  ];

  return (
    <ResponsiveListTable<CustomerResponseItem>
      items={items}
      getRowKey={(r) => r.id}
      emptyState={emptyState}
      /* Mobile card */
      renderMobileCard={(r) => (
        <div key={r.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="min-w-0">
            <div className="font-medium truncate">
              {r.survey?.title ?? "Untitled survey"}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{r.rating ?? "—"} / 5</Badge>
              <span className="text-xs text-muted-foreground">
                Submitted {fmt(r.submitted_at)}
              </span>
            </div>

            {(r.selected_traits?.length ?? 0) > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {r.selected_traits!.map((t, i) => (
                  <Badge key={`${r.id}-m-trait-${i}`} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-2 text-sm text-muted-foreground">
              {r.comment ?? "—"}
            </div>
          </div>
        </div>
      )}
      /* Desktop columns */
      columns={columns}
    />
  );
}
