"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getActiveBusiness } from "@/actions";

export async function deleteReferralProgram(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing program id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { business } = await getActiveBusiness();
  if (!business) {
    throw new Error("No active business selected.");
  }

  // RLS should allow delete only for the owner; the extra filter is a safety belt.
  const { error } = await supabase
    .from("referral_program")
    .delete()
    .eq("id", id)
    .eq("business_id", business.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/referrals");
}

