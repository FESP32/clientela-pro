import { getProductOptions, createSurvey } from "@/actions/surveys";
import NewSurveyForm from "@/components/dashboard/new-survey-form";

export const dynamic = "force-dynamic";

export default async function NewSurveyPage() {
  const products = await getProductOptions();

  return <NewSurveyForm products={products} action={createSurvey} />;
}
