// app/(dashboard)/surveys/[id]/responses/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSurveyWithResponses } from "@/actions/surveys";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fmt } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function SurveyResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { survey, responses, error } = await getSurveyWithResponses(id);

  if (!survey && !error) {
    // Survey not found (or not accessible to this user due to RLS)
    notFound();
  }

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-4xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Survey Responses</CardTitle>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/surveys/${id}/respond`}>Respond</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/surveys">Back to Surveys</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const count = responses.length;
  const avg =
    count === 0
      ? 0
      : Math.round(
          (responses.reduce((a, r) => a + (r.rating || 0), 0) / count) * 10
        ) / 10;

  return (
    <div className="p-4">
      <Card className=" max-w-6xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Responses — {survey?.title ?? "Survey"}</CardTitle>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/surveys/${id}/respond`}>Respond</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/surveys">Back to Surveys</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Total: {count}</Badge>
            <Badge>Avg rating: {avg.toFixed(1)}</Badge>
          </div>

          {responses.length === 0 ? (
            <div className="rounded-lg border p-6">
              <p className="font-medium mb-1">No responses yet</p>
              <p className="text-sm text-muted-foreground">
                Share your survey or add a test response.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%]">Rating</TableHead>
                  <TableHead className="w-[10%]">Respondent</TableHead>
                  <TableHead className="w-[40%]">Traits</TableHead>
                  <TableHead className="w-[35%]">Comment</TableHead>
                  <TableHead className="w-[15%]">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.rating}★</TableCell>
                    <TableCell className="font-medium">
                      {r.respondent?.name ?? ""}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.selected_traits?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {r.selected_traits.map((t, i) => (
                            <Badge key={`${r.id}-t-${i}`} variant="secondary">
                              {t as string}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.comment ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(r.submitted_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
