import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getMyResponses } from "@/actions";
import { fmt } from "@/lib/utils";

export default async function MyResponsesList() {
  const responses = await getMyResponses();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Survey Responses</CardTitle>
      </CardHeader>
      <CardContent>
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not submitted any responses yet.
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Survey</TableHead>
                  <TableHead className="w-[120px]">Rating</TableHead>
                  <TableHead>Selected Traits</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="w-[200px]">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.survey?.title ?? "Untitled survey"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.rating} / 5</Badge>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="flex flex-wrap gap-1">
                        {(r.selected_traits ?? []).map((t, i) => (
                          <Badge key={i} variant="outline">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[360px]">
                      <p className="truncate">{r.comment ?? "—"}</p>
                    </TableCell>
                    <TableCell>{fmt(r.submitted_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
