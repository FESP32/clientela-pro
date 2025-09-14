"use server";

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  ResponseWithSurvey,
  SurveyRow,
  SurveyWithProduct,
  SurveyWithResponses,
} from "@/types";
import { getActiveBusiness } from "@/actions/business/read";

export async function getSurvey(id: string): Promise<SurveyRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("survey")
    .select("id, title, status, description, traits, is_anonymous")
    .eq("id", id)
    .single<SurveyRow>();

  if (error) return null;
  return data;
}

export async function getSurveyWithProduct(surveyId: string) {
  if (!surveyId) throw new Error("Missing survey id");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("survey")
    .select(
      `
      id, title, description, status, is_anonymous, starts_at, ends_at, created_at, business_id, product_id,
      product:product!survey_product_id_fk ( id, name )
    `
    )
    .eq("id", surveyId)
    .single()
    .overrideTypes<SurveyWithProduct>();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSurveyWithResponses(
  surveyId: string
): Promise<SurveyWithResponses> {
  if (!surveyId) throw new Error("Missing survey id");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("survey")
    .select(
      `
      id, title, description, is_anonymous, status, starts_at, ends_at, created_at, max_responses,
      responses:response!response_survey_id_fk (
        id, rating, selected_traits, comment, submitted_at,
        respondent:profile!response_respondent_id_fk_profile ( user_id, name )
      )
    `
    )
    .eq("id", surveyId)
    .single()
    .overrideTypes<SurveyWithResponses>();

  if (error) {
    console.error("Error fetching surveys:", error.message);
    notFound();
  }
  if (!data) throw new Error("Survey not found");

  return data;
}

export async function listSurveys(): Promise<SurveyWithProduct[]> {
  const supabase = await createClient();


  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { data, error } = await supabase
    .from("survey")
    .select(
      `
      id, title, description, status, is_anonymous, starts_at, ends_at, created_at, business_id, product_id,
      product:product!survey_product_id_fk ( id, name )
    `
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .overrideTypes<SurveyWithProduct[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

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

export async function listLatestSurveys(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("survey")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<SurveyRow[]>();

  if (error) {
    console.error("Error fetching surveys:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getSurveyCountForBusiness(
  businessId: string
): Promise<number> {
  if (!businessId) throw new Error("businessId is required");

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("survey")
    .select("id", { head: true, count: "exact" })
    .eq("business_id", businessId);

  if (error) throw new Error(`Failed to count surveys: ${error.message}`);
  return count ?? 0;
}

export async function getSurveyResponseCount(
  surveyId: string
): Promise<number> {
  if (!surveyId) throw new Error("surveyId is required");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "count_responses_for_survey",
    { p_survey_id: surveyId }
  );

  if (error) {
    throw new Error(
      `count_responses_for_survey_norls failed: ${error.message}`
    );
  }

  // Supabase may return smallint as number or string; normalize to number.
  const n = typeof data === "number" ? data : Number(data ?? 0);

  // Extra safety: clamp to [0, 250]
  return Math.max(0, Math.min(250, n));
}
