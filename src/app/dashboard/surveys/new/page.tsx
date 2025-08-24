import { listProducts } from "@/actions";
import { createSurvey } from "@/actions/surveys";
import NewSurveyForm from "@/components/dashboard/surveys/new-survey-form";

export const dynamic = "force-dynamic";

export default async function NewSurveyPage() {
  const { products } = await listProducts();
  return <NewSurveyForm products={products} action={createSurvey} />;
}
