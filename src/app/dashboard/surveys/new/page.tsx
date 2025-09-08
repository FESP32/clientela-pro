import { listProducts } from "@/actions";
import { createSurvey } from "@/actions";
import NewSurveyForm from "@/components/dashboard/surveys/new-survey-form";

export const dynamic = "force-dynamic";

export default async function NewSurveyPage() {
  const { data } = await listProducts();
  return (
    <div className="px-5 sm:px-6 lg:px-16 mt-8 mb-24">
      <NewSurveyForm products={data} action={createSurvey} />
    </div>
  );
  
}
