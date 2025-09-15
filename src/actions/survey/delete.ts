"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getActiveBusiness } from "@/actions/business/read";

export async function deleteSurvey(formData: FormData): Promise<void> {
  const surveyId = formData.get("surveyId") as string;
  if (!surveyId) throw new Error("Missing cardId");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { error } = await supabase
    .from("survey")
    .delete()
    .eq("id", surveyId)
    .eq("business_id", business.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/surveys");
}

