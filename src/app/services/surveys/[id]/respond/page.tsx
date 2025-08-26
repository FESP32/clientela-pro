// app/(dashboard)/surveys/[id]/respond/page.tsx
import { getSurvey, submitResponse } from "@/actions/surveys";
import { notFound } from "next/navigation";
import RespondForm from "@/components/services/surveys/respond-form";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function RespondPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch survey (make sure it includes `is_anonymous`)
  const survey = await getSurvey(id);
  if (!survey) notFound();

  // Get auth status server-side and pass it to the client component
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  let hasResponded = false;

  if (!survey.is_anonymous && isAuthenticated) {
    // For non-anonymous surveys we can check by respondent_id
    const { count, error } = await supabase
      .from("response")
      .select("id", { count: "exact", head: true })
      .eq("survey_id", survey.id)
      .eq("respondent_id", user!.id);

    // If count > 0, user has an existing response
    if (!error && (count ?? 0) > 0) {
      hasResponded = true;
    }
  }

  return (
    <RespondForm
      survey={survey}
      isAuthenticated={isAuthenticated}
      hasResponded={hasResponded}
      onSubmit={submitResponse}
    />
  );
}
