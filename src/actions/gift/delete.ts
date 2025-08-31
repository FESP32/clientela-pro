// actions/gifts/delete-gift.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getActiveBusiness } from "../business";

export async function deleteGift(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing gift id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { business } = await getActiveBusiness();
  if (!business) {
    throw new Error("No active business selected.");
  }

  // RLS should allow delete only for authorized users.
  // Extra filter ensures we only delete within the active business.
  // NOTE: gift_intent rows will cascade-delete via FK ON DELETE CASCADE.
  const { error } = await supabase
    .from("gift")
    .delete()
    .eq("id", id)
    .eq("business_id", business.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/gifts");
}
