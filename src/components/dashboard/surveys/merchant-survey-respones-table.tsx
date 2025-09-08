// components/dashboard/surveys/survey-responses-table.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/utils";
import type { SurveyWithResponses } from "@/types";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";

export default function MerchantSurveyResponsesTable({
  survey,
}: {
  survey: SurveyWithResponses;
}) {
  const showRespondentCol = !survey.is_anonymous;
  const responses = survey.responses ?? [];

  if (!responses.length) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No responses yet.
      </div>
    );
  }

  type ResponseItem = NonNullable<SurveyWithResponses["responses"]>[number];

  const baseColumns: Column<ResponseItem>[] = [
    {
      key: "rating",
      header: "Rating",
      headClassName: "w-[100px]",
      cell: (r) => <Badge variant="secondary">{r.rating} / 5</Badge>,
    },
    {
      key: "traits",
      header: "Selected Traits",
      cell: (r) => (
        <div className="flex max-w-[420px] flex-wrap gap-1">
          {(r.selected_traits ?? []).length
            ? (r.selected_traits ?? []).map((t, i) => (
                <Badge key={`${r.id}-trait-${i}`} variant="outline">
                  {t}
                </Badge>
              ))
            : "—"}
        </div>
      ),
    },
    {
      key: "comment",
      header: "Comment",
      cell: (r) => <p className="max-w-[520px] truncate">{r.comment ?? "—"}</p>,
    },
    {
      key: "submitted",
      header: "Submitted",
      headClassName: "w-[220px]",
      cell: (r) => fmt(r.submitted_at),
    },
  ];

  const columns: Column<ResponseItem>[] = showRespondentCol
    ? [
        {
          key: "respondent",
          header: "Respondent",
          headClassName: "w-[220px]",
          cell: (r) =>
            r.respondent?.name ??
            "—",
        },
        ...baseColumns,
      ]
    : baseColumns;

  const emptyState = (
    <div className="rounded-lg border p-6 text-sm text-muted-foreground">
      No responses yet.
    </div>
  );

  return (
    <ResponsiveListTable<ResponseItem>
      items={responses}
      getRowKey={(r) => r.id}
      emptyState={emptyState}
      /* Mobile cards */
      renderMobileCard={(r) => (
        <div key={r.id} className="rounded-lg border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{r.rating} / 5</Badge>
                {showRespondentCol && (
                  <span className="text-xs text-muted-foreground truncate">
                    {r.respondent?.name}
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {(r.selected_traits ?? []).length ? (
                  (r.selected_traits ?? []).map((t, i) => (
                    <Badge key={`${r.id}-trait-m-${i}`} variant="outline">
                      {t}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>

              <div className="mt-2 text-sm">
                <p className="line-clamp-2">
                  {r.comment ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </p>
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Submitted {fmt(r.submitted_at)}
              </div>
            </div>
          </div>
        </div>
      )}
      /* Desktop table */
      columns={columns}
    />
  );
}
