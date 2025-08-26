import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmt } from "@/lib/utils";
import type { SurveyWithResponses } from "@/types"; // uses your helper-based types

export default function SurveyResponsesTable({
  survey,
}: {
  survey: SurveyWithResponses;
}) {
  const showRespondentCol = !survey.is_anonymous;

  if (!survey.responses?.length) {
    return <p className="text-sm text-muted-foreground">No responses yet.</p>;
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showRespondentCol && (
              <TableHead className="w-[220px]">Respondent</TableHead>
            )}
            <TableHead className="w-[100px]">Rating</TableHead>
            <TableHead>Selected Traits</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead className="w-[220px]">Submitted</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {survey.responses.map((r) => (
            <TableRow key={r.id}>
              {showRespondentCol && (
                <TableCell className="text-muted-foreground">
                  {r.respondent?.name ?? r.respondent?.user_id ?? "—"}
                </TableCell>
              )}

              <TableCell>
                <Badge variant="secondary">{r.rating} / 5</Badge>
              </TableCell>

              <TableCell className="max-w-[320px]">
                <div className="flex flex-wrap gap-1">
                  {(r.selected_traits ?? []).map((t, i) => (
                    <Badge key={`${r.id}-trait-${i}`} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </TableCell>

              <TableCell className="max-w-[420px]">
                <p className="truncate">{r.comment ?? "—"}</p>
              </TableCell>

              <TableCell>{fmt(r.submitted_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
