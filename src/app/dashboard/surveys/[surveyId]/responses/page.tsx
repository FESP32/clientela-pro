import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SurveyResponsesTable from "@/components/dashboard/surveys/survey-respones-table"
import { getSurveyWithResponses } from "@/actions"; // or wherever you placed it

export default async function Page({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  const survey = await getSurveyWithResponses(surveyId);
  if (!survey) notFound();

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
        </CardHeader>
        <CardContent>{/* put survey meta here if you want */}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Responses{" "}
            {survey.responses.length ? `(${survey.responses.length})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SurveyResponsesTable survey={survey} />
        </CardContent>
      </Card>
    </div>
  );
}
