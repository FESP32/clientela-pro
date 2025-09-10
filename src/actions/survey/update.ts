// app/actions/surveys.ts (or src/actions/surveys.ts)
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/** Mark a survey as finished (idempotent). */
export async function finishSurvey(surveyId: string): Promise<void> {
  if (!surveyId) throw new Error("Missing survey_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Only update if not already finished
  const { data, error } = await supabase
    .from("survey")
    .update({ status: "finished" })
    .eq("id", surveyId)
    .neq("status", "finished")
    .select("id, status")
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    // Either not found or already finished — clarify if possible
    const { data: check, error: checkErr } = await supabase
      .from("survey")
      .select("id, status")
      .eq("id", surveyId)
      .maybeSingle();

    if (checkErr) throw new Error(checkErr.message);
    if (!check) throw new Error("Survey not found or not accessible");
    // Already finished → treat as success (idempotent)
  }

  revalidatePath("/dashboard/surveys");
  revalidatePath(`/dashboard/surveys/${surveyId}`);
  // no return
}

/** Toggle between active/inactive (no-op for finished surveys). */
export async function toggleSurveyActive(surveyId: string): Promise<void> {
  if (!surveyId) throw new Error("Missing survey_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Read current state (RLS enforces permissions)
  const { data: row, error: readErr } = await supabase
    .from("survey")
    .select("id, status")
    .eq("id", surveyId)
    .maybeSingle();

  if (readErr) throw new Error(readErr.message);
  if (!row) throw new Error("Survey not found or not accessible");
  if (row.status === "finished")
    throw new Error("Finished surveys cannot be toggled");

  const nextStatus = row.status === "active" ? "inactive" : "active";

  const { data: updated, error: updErr } = await supabase
    .from("survey")
    .update({ status: nextStatus })
    .eq("id", surveyId)
    .eq("status", row.status) // optimistic concurrency guard
    .select("id, status")
    .maybeSingle();

  if (updErr) throw new Error(updErr.message);
  if (!updated)
    throw new Error("Survey status changed concurrently. Try again.");

  revalidatePath("/dashboard/surveys");
  revalidatePath(`/dashboard/surveys/${surveyId}`);
  // no return
}
