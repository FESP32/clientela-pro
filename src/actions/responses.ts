"use server";

import { createClient } from "@/utils/supabase/server";

export type MyResponse = {
  id: string;
  rating: number;
  selected_traits: string[];
  comment: string | null;
  submitted_at: string;
  survey: {
    id: string;
    title: string;
    product_id: string | null;
  } | null;
};

// Internal row type matching our SELECT shape
type ResponseRow = MyResponse;

export async function getMyResponses(): Promise<MyResponse[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!user) return [];

  const { data, error } = await supabase
    .from("responses")
    .select(
      `
      id,
      rating,
      selected_traits,
      comment,
      submitted_at,
      survey:surveys!responses_survey_id_fkey (
        id,
        title,
        product_id
      )
    `
    )
    // 👆 The !responses_survey_id_fkey tells Supabase it's a 1:1 join, not an array
    .eq("respondent_id", user.id)
    .order("submitted_at", { ascending: false })
    .returns<ResponseRow[]>(); // 👈 Strongly type the result

  if (error) throw new Error(error.message);
  return data ?? [];
}
