"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  ResponseWithSurvey,
  SurveyInsert,
  SurveyRow,
  SurveyWithProduct,
  SurveyWithResponses,
} from "@/types";
import { getBool } from "@/lib/utils";
import { SurveyFromFormSchema } from "@/schemas/surveys";
import { getActiveBusiness } from "@/actions/business/read";

export async function getSurvey(id: string): Promise<SurveyRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("survey")
    .select("id,title,description,traits,is_anonymous")
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
      id, title, description, is_active, is_anonymous, starts_at, ends_at, created_at, business_id, product_id,
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
      id, title, description, is_anonymous, is_active, starts_at, ends_at, created_at,
      responses:response!response_survey_id_fk (
        id, rating, selected_traits, comment, submitted_at,
        respondent:profile!response_respondent_id_fk_profile ( user_id, name )
      )
    `
    )
    .eq("id", surveyId)
    .single()
    .overrideTypes<SurveyWithResponses>(); // <-- use returns<T>(), not overrideTypes

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Survey not found");

  return data;
}

export async function listSurveys(): Promise<SurveyWithProduct[]> {
  const supabase = await createClient();

  const { business } = await getActiveBusiness();
  if (!business) {
    throw new Error("No active business selected.");
  }

  const { data, error } = await supabase
    .from("survey")
    .select(
      `
      id, title, description, is_active, is_anonymous, starts_at, ends_at, created_at, business_id, product_id,
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
