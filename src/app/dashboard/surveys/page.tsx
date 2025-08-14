// app/(dashboard)/surveys/page.tsx
import Link from "next/link";
import { format } from "date-fns";
import { listSurveys, deleteSurvey } from "./actions";


import { Button } from "@/components/ui/button";
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

export const dynamic = "force-dynamic";

function fmt(d?: string | null) {
  if (!d) return "—";
  try {
    return format(new Date(d), "PPP");
  } catch {
    return "—";
  }
}

export default async function SurveysPage() {
  const { user, surveys, error } = await listSurveys();

  if (!user) {
    return (
      <Card className="mt-10 max-w-6xl">
        <CardHeader>
          <CardTitle>Surveys</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You must be signed in to view your surveys.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-3xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Surveys</CardTitle>
          <Button asChild>
            <Link href="/dashboard/surveys/new">New Survey</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load surveys: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Card className="max-w-6xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Your Surveys</CardTitle>
          <Button asChild>
            <Link href="/dashboard/surveys/new">New Survey</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {surveys.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div>
                <p className="font-medium">No surveys yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first survey to get started.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/surveys/new">Create Survey</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">Title</TableHead>
                  <TableHead className="w-[22%]">Product</TableHead>
                  <TableHead className="w-[18%]">Window</TableHead>
                  <TableHead className="w-[12%]">Traits</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[8%] text-right">Actions</TableHead>
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
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/services/surveys/${s.id}/respond`}>
                          Respond
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/dashboard/surveys/${s.id}/responses`}>
                          View
                        </Link>
                      </Button>
                      {/* Delete button */}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
