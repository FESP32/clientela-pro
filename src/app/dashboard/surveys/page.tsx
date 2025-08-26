// app/dashboard/surveys/page.tsx
import { deleteSurvey, listSurveys } from "@/actions";
import SurveysTable from "@/components/dashboard/surveys/surveys-table";

export default async function Page() {
  const items = await listSurveys();
  return (
    <div className="container mx-auto p-4">
      <SurveysTable items={items} deleteSurvey={deleteSurvey} />
    </div>
  );
}
