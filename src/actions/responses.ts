"use server";

import {
  ResponseWithSurvey,
} from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function getMyResponses(): Promise<ResponseWithSurvey[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("response")
    .select(
      `
      id,
      rating,
      selected_traits,
      comment,
      submitted_at,
      survey:survey!response_survey_id_fk ( title )
    `
    )
    .eq("respondent_id", user.id)
    .order("submitted_at", { ascending: false })
    .overrideTypes<ResponseWithSurvey[]>(); // <- no normalization needed

  if (error) throw new Error(error.message);
  return data ?? [];
}