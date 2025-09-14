"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { SurveyInsert } from "@/types";
import { getBool } from "@/lib/utils";
import { SurveyFromFormSchema } from "@/schemas/surveys";
import { getActiveBusiness } from "@/actions/business/read";
import { SubscriptionMetadata } from "@/types/subscription";
import { getOwnerPlanForBusiness } from "../subscription";
import { getSurveyCountForBusiness, getSurveyResponseCount } from "@/actions";

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
    .from("survey")
    .select("is_anonymous, max_responses")
    .eq("id", survey_id)
    .single();

  if (surveyError || !survey) {
    notFound();
  }

  const responseCount = await getSurveyResponseCount(survey_id);
  
  if (responseCount > survey.max_responses) {
    return { success: false, message: "Cannot submit more responses" };
  }

  const respondent_id = survey.is_anonymous ? null : user?.id ?? null;

  const { error } = await supabase.from("response").insert({
    survey_id,
    respondent_id,
    rating,
    selected_traits,
    comment: comment || null,
  });

  if (error) {
    return { success: false, message: "You are not allowed to respond this survey" };
  }

  revalidatePath(`/dashboard/surveys/${survey_id}/respond`);

  return { success: true, message: "Response submitted successfully" };
}

export async function createSurvey(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { business } = await getActiveBusiness();

  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const subscriptionPlan = await getOwnerPlanForBusiness(business.id);

  const subscriptionMetadata =
    subscriptionPlan.metadata as SubscriptionMetadata;
  const surveyCount = await getSurveyCountForBusiness(business.id);

  if (surveyCount >= subscriptionMetadata.max_surveys) {
    return { success: false, message: "Max survey count reached" };
  }

  const parsed = SurveyFromFormSchema.safeParse({
    product_id: formData.get("product_id"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    is_anonymous: formData.get("is_anonymous") ?? "true",
    starts_at: formData.get("starts_at") ?? "",
    ends_at: formData.get("ends_at") ?? "",
    max_responses: Number(formData.get("max_responses")) ?? 1,
    traits_1: formData.get("traits_1") ?? "",
    traits_2: formData.get("traits_2") ?? "",
    traits_3: formData.get("traits_3") ?? "",
    traits_4: formData.get("traits_4") ?? "",
    traits_5: formData.get("traits_5") ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    return { success: false, message: msg  };
  }

  const {
    product_id,
    title,
    description,
    starts_at,
    ends_at,
    max_responses,
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
    business_id: business.id,
    product_id,
    title,
    description,
    status: "active",
    max_responses,
    is_anonymous: getBool(formData, "is_anonymous"),
    starts_at: new Date(starts_at).toISOString(),
    ends_at: new Date(ends_at).toISOString(),
    traits,
  };

  const { error } = await supabase.from("survey").insert(insertPayload);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/surveys");

  return { success: true, message: "Survey created successfully" };
}
