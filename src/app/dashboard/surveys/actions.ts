"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export type SurveyRow = {
  id: string;
  owner_id: string;
  product_id: string;
  title: string;
  description: string | null;
  traits:
    | Array<{
        label: string;
        sentiment?: "positive" | "neutral" | "negative";
        score?: number;
      }>
    | [];
  is_active: boolean;
  is_anonymous: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  product_name?: string;
  traits_count?: number;
};

export type ResponseRow = {
  id: string;
  survey_id: string;
  respondent_id: string | null;
  rating: number;
  respondent?: {
    name: string;
  };
  selected_traits: string[];
  comment: string | null;
  submitted_at: string;
};

export type SurveyRecord = {
  id: string;
  title: string;
  description: string | null;
  is_anonymous: boolean;
  traits: Array<{
    label: string;
    sentiment?: "positive" | "neutral" | "negative";
    score?: number;
  }>;
};

function getBool(fd: FormData, name: string) {
  const v = fd.get(name);
  // handles: "true", "on", "1", true, 1
  return v === "true" || v === "on" || v === "1";
}

export async function getSurvey(id: string): Promise<SurveyRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("surveys")
    .select("id,title,description,traits,is_anonymous")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as SurveyRecord;
}

export async function getSurveyWithResponses(surveyId: string) {
  const supabase = await createClient();

  const { data: survey, error: sErr } = await supabase
    .from("surveys")
    .select("id, title")
    .eq("id", surveyId)
    .single();

  if (sErr) {
    return {
      survey: null,
      responses: [] as ResponseRow[],
      error: sErr.message,
    };
  }

  const { data: responses, error: rErr } = await supabase
    .from("responses")
    .select(
      `id, survey_id, respondent_id, rating, selected_traits, comment, submitted_at,
       respondent:profiles(name)
      `
    )
    .eq("survey_id", surveyId)
    .order("submitted_at", { ascending: false });

  return {
    survey,
    responses: (responses ?? []) as unknown as ResponseRow[],
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
    .order("created_at", { ascending: false });

  if (error) return { user, surveys: [], error: error.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const surveys: SurveyRow[] = (data ?? []).map((row: any) => ({
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

const SurveyFromFormSchema = z.object({
  product_id: z.string().uuid({ message: "Select a product." }),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  is_active: z
    .preprocess(
      (v) => v === "on" || v === "true" || v === true || v === 1 || v === "1",
      z.boolean()
    )
    .optional(),
  is_anonymous: z
    .preprocess(
      (v) => v === "on" || v === "true" || v === true || v === 1 || v === "1",
      z.boolean()
    )
    .default(false),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  // original textarea fields (still supported as fallback)
  traits_1: z.string().optional().default(""),
  traits_2: z.string().optional().default(""),
  traits_3: z.string().optional().default(""),
  traits_4: z.string().optional().default(""),
  traits_5: z.string().optional().default(""),
});

export async function createSurvey(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  console.log(formData);

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

  const insertPayload = {
    owner_id: user.id,
    product_id,
    title,
    description,
    is_active: getBool(formData, "is_active"),
    is_anonymous: getBool(formData, "is_anonymous"), // <- NEW
    starts_at: starts_at ? new Date(starts_at).toISOString() : null,
    ends_at: ends_at ? new Date(ends_at).toISOString() : null,
    traits, // [{label, sentiment, score}]
  };

  const { error } = await supabase.from("surveys").insert(insertPayload);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/surveys");
  redirect("/dashboard/surveys");
}

export type ProductOption = { id: string; name: string };

export async function getProductOptions(): Promise<ProductOption[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("products")
    .select("id,name")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });

  return (data ?? []) as ProductOption[];
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
