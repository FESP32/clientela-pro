import { listProducts } from "@/actions";
import { createSurvey } from "@/actions";
import NewSurveyForm from "@/components/dashboard/surveys/new-survey-form";

export const dynamic = "force-dynamic";

export default async function NewSurveyPage() {
  const { data } = await listProducts();
  return <NewSurveyForm products={data} action={createSurvey} />;
}
