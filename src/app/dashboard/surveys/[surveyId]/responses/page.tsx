import { notFound } from "next/navigation";
import MerchantSurveyResponsesTable from "@/components/dashboard/surveys/merchant-survey-respones-table";
import { getSurveyWithResponses } from "@/actions"; // or wherever you placed it
import MerchantListSection from "@/components/common/merchant-list-section";

export default async function Page({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const survey = await getSurveyWithResponses(surveyId);  
  if (!survey) notFound();
  
  return (
    <MerchantListSection
      title={survey.title}
      subtitle={
        <div className="flex flex-col gap-1.5 text-sm  sm:items-center sm:justify-between">
          <p className="line-clamp-2 max-w-prose leading-relaxed text-muted-foreground">
            {survey.description ||
              "Share your experience — your feedback helps improve this service."}
          </p>

          <span className="inline-flex shrink-0 items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
              Responses
            </span>
            <span className="rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
              {Number.isFinite(survey.max_responses)
                ? `${survey.responses.length} / ${survey.max_responses}`
                : `${survey.responses.length}`}
            </span>
          </span>
        </div>
      }
    >
      <MerchantSurveyResponsesTable survey={survey} />
    </MerchantListSection>
  );
}
