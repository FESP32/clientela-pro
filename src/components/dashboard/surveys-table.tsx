// components/surveys/survey-table.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { SurveyRow } from "@/types";


export default function SurveysTable({
  surveys,
  deleteSurvey,
}: {
  surveys: SurveyRow[];
  deleteSurvey: (id: string) => Promise<void>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[24%]">Title</TableHead>
          <TableHead className="w-[18%]">Product</TableHead>
          <TableHead className="w-[16%]">Window</TableHead>
          <TableHead className="w-[10%]">Traits</TableHead>
          <TableHead className="w-[10%]">Status</TableHead>
          <TableHead className="w-[12%]">Anonymous</TableHead>
          <TableHead className="w-[10%] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {surveys.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">
              <Link
                href={`/dashboard/surveys/${s.id}/responses`}
                className="text-blue-600 hover:underline"
              >
                {s.title}
              </Link>
            </TableCell>
            <TableCell>{s.product_name ?? "—"}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {fmt(s.starts_at)} — {fmt(s.ends_at)}
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{s.traits_count ?? 0}</Badge>
            </TableCell>
            <TableCell>
              {s.is_active ? (
                <Badge>Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {s.is_anonymous ? (
                <Badge variant="secondary">Yes</Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </TableCell>
            <TableCell className="text-right flex gap-2 justify-end">
              <Button asChild size="sm" variant="outline">
                <Link href={`/services/surveys/${s.id}/respond`}>Respond</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/dashboard/surveys/${s.id}/responses`}>View</Link>
              </Button>
              <form action={deleteSurvey.bind(null, s.id)}>
                <Button size="sm" variant="destructive" type="submit">
                  Delete
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
