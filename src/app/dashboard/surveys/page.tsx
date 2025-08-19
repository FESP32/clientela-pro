// app/(dashboard)/surveys/page.tsx
import Link from "next/link";
import { listSurveys, deleteSurvey } from "@/actions/surveys";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SurveyTable from "@/components/dashboard/surveys-table";

export const dynamic = "force-dynamic";

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
            <SurveyTable surveys={surveys} deleteSurvey={deleteSurvey} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
