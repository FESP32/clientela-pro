import { getSurvey, submitResponse } from "@/app/dashboard/surveys/actions";
import { notFound } from "next/navigation";
import RespondForm from "@/components/services/respond-form";

export const dynamic = "force-dynamic";

export default async function RespondPage(props: { params: { id: string } }) {
  const { params } = props;
  const { id } = await params;
  const survey = await getSurvey(id);
  if (!survey) notFound();

  return <RespondForm survey={survey} onSubmit={submitResponse} />;
}

