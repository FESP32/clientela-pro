"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import {
  LatestSurvey,
  SurveyWithProduct,
  SurveyInsert,
  SurveyListItem,
  SurveyRow,
  ResponseWithRespondent,
  SurveyRowWithTraits,
} from "@/types";
import { getBool } from "@/lib/utils";
import { SurveyFromFormSchema } from "@/schemas/surveys";

export async function getSurvey(id: string): Promise<SurveyRowWithTraits | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("surveys")
    .select("id,title,description,traits,is_anonymous")
    .eq("id", id)
    .single<SurveyRowWithTraits>();

  if (error) return null;
  return data;
}

export async function getSurveyWithResponses(surveyId: string) {
  const supabase = await createClient();

  const { data: survey, error: sErr } = await supabase
    .from("surveys")
    .select("id, title")
    .eq("id", surveyId)
    .maybeSingle<Pick<SurveyRow, "id" | "title">>();

  if (sErr) {
    return {
      survey: null,
      responses: [] as ResponseWithRespondent[],
      error: sErr.message,
    };
  }

  const { data: responses, error: rErr } = await supabase
    .from("responses")
    .select(
      `id, survey_id, respondent_id, rating, selected_traits, comment, submitted_at,
       respondent:profiles!responses_respondent_id_fkey(name)
      `
    )
    .eq("survey_id", surveyId)
    .order("submitted_at", { ascending: false })
    .overrideTypes<ResponseWithRespondent[]>();

  return {
    survey,
    responses: responses ?? [],
    error: rErr?.message ?? null,
  };
}

export async function submitResponse(formData: FormData) {
  const supabase = await createClient();

  const survey_id = String(formData.get("survey_id") ?? "").trim();
  const ratingStr = String(formData.get("rating") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();

  if (!survey_id) {
    return { success: false, message: "Missing survey_id" };
  }

  const rating = Number(ratingStr);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, message: "Rating must be between 1 and 5." };
  }

  const selected_traits = formData.getAll("selected_traits").map(String);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: survey, error: surveyError } = await supabase
    .from("surveys")
    .select("is_anonymous")
    .eq("id", survey_id)
    .single();

  if (surveyError || !survey) {
    return { success: false, message: "Survey not found" };
  }

  // ── Respect anonymity
  const respondent_id = survey.is_anonymous ? null : user?.id ?? null;

  const { error } = await supabase.from("responses").insert({
    survey_id,
    respondent_id,
    rating,
    selected_traits,
    comment: comment || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath(`/dashboard/surveys/${survey_id}/respond`);

  return { success: true, message: "Response submitted successfully" };
}

export async function listSurveys() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      surveys: [] as SurveyRow[],
      error: null as string | null,
    };
  }

  const { data, error } = await supabase
    .from("surveys")
    .select(
      `
      id, owner_id,
      product_id, title, description, 
      is_anonymous ,traits, is_active, 
      starts_at, ends_at, created_at, updated_at,
      products!inner ( name )
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .overrideTypes<SurveyWithProduct[]>(); // <- enforce the row type;

  if (error) return { user, surveys: [], error: error.message };

  const surveys: SurveyListItem[] = (data ?? []).map((row) => ({
    ...row,
    product_name: row.products?.name ?? "",
    traits_count: Array.isArray(row.traits) ? row.traits.length : 0,
  }));

  return { user, surveys, error: null };
}

/** Parse textarea lines like: "too sweet | negative" */
function parseLinesToTraits(block: string, score: 1 | 2 | 3 | 4 | 5) {
  const lines = (block || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line) => {
    const [rawLabel, rawSentiment] = line
      .split("|")
      .map((s) => s?.trim() ?? "");
    const label = rawLabel.toLowerCase();
    const sentiment = (rawSentiment || "neutral").toLowerCase();
    const normSentiment = (["positive", "neutral", "negative"] as const)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .includes(sentiment as any)
      ? (sentiment as "positive" | "neutral" | "negative")
      : "neutral";
    return { label, sentiment: normSentiment, score };
  });
}

/** NEW: collect rows posted as arrays from the TraitsPerScore component */
function collectArrayTraits(formData: FormData, score: 1 | 2 | 3 | 4 | 5) {
  const labels = formData
    .getAll(`traits_${score}[]`)
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean);

  const sentiments = formData
    .getAll(`sentiment_${score}[]`)
    .map(String)
    .map((s) => s.trim().toLowerCase()) as Array<
    "positive" | "neutral" | "negative" | string
  >;

  const items: Array<{
    label: string;
    sentiment: "positive" | "neutral" | "negative";
    score: number;
  }> = [];
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i].toLowerCase();
    const raw = sentiments[i] || "neutral";
    const sentiment: "positive" | "neutral" | "negative" =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw === "positive" || raw === "negative" ? (raw as any) : "neutral";
    items.push({ label, sentiment, score });
  }
  return items;
}

export async function createSurvey(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ✅ Include is_anonymous in parsing
  const parsed = SurveyFromFormSchema.safeParse({
    product_id: formData.get("product_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    is_active: formData.get("is_active") ?? undefined,
    is_anonymous: formData.get("is_anonymous") ?? "true", // <- NEW
    starts_at: formData.get("starts_at") ?? "",
    ends_at: formData.get("ends_at") ?? "",
    traits_1: formData.get("traits_1") ?? "",
    traits_2: formData.get("traits_2") ?? "",
    traits_3: formData.get("traits_3") ?? "",
    traits_4: formData.get("traits_4") ?? "",
    traits_5: formData.get("traits_5") ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(msg);
  }

  const {
    product_id,
    title,
    description,
    starts_at,
    ends_at,
    traits_1,
    traits_2,
    traits_3,
    traits_4,
    traits_5,
  } = parsed.data;

  // 1) Prefer array inputs from the TraitsPerScore component
  let traits = [
    ...collectArrayTraits(formData, 1),
    ...collectArrayTraits(formData, 2),
    ...collectArrayTraits(formData, 3),
    ...collectArrayTraits(formData, 4),
    ...collectArrayTraits(formData, 5),
  ];

  // 2) Fallback to textarea parsing if arrays weren’t used
  if (traits.length === 0) {
    traits = [
      ...parseLinesToTraits(traits_1!, 1),
      ...parseLinesToTraits(traits_2!, 2),
      ...parseLinesToTraits(traits_3!, 3),
      ...parseLinesToTraits(traits_4!, 4),
      ...parseLinesToTraits(traits_5!, 5),
    ];
  }

  const insertPayload: SurveyInsert = {
    owner_id: user.id,
    product_id,
    title,
    description,
    is_active: getBool(formData, "is_active"),
    is_anonymous: getBool(formData, "is_anonymous"), // <- NEW
    starts_at: starts_at ? new Date(starts_at).toISOString() : null,
    ends_at: ends_at ? new Date(ends_at).toISOString() : null,
    traits,
  };

  const { error } = await supabase.from("surveys").insert(insertPayload);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/surveys");
  redirect("/dashboard/surveys");
}

export async function deleteSurvey(surveyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("surveys")
    .delete()
    .eq("id", surveyId)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/surveys");
}

export async function listLatestSurveys(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("surveys")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<LatestSurvey[]>();

  if (error) {
    console.error("Error fetching surveys:", error.message);
    return [];
  }

  return data ?? [];
}
