import { notFound } from "next/navigation";
import MerchantSurveyResponsesTable from "@/components/dashboard/surveys/merchant-survey-respones-table";
import { getSurveyWithResponses } from "@/actions"; // or wherever you placed it
import MerchantListSection from "@/components/dashboard/common/merchant-list-section";

export default async function Page({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const survey = await getSurveyWithResponses(surveyId);
  if (!survey) notFound();
  return (
    <MerchantListSection title={survey.title} subtitle="Responses">
      <MerchantSurveyResponsesTable survey={survey} />
    </MerchantListSection>
  );
}
