"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function deleteBusiness(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("business_id") ?? "").trim();
  if (!id) throw new Error("Missing business id");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // Verify ownership
  const { data: biz, error: bizErr } = await supabase
    .from("business")
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (bizErr) throw new Error(bizErr.message);
  if (!biz) throw new Error("Business not found.");
  if (biz.owner_id !== user.id) {
    throw new Error("Only the owner can delete this business.");
  }

  // Delete (cascades will clean up related rows)
  const { error: delErr } = await supabase
    .from("business")
    .delete()
    .eq("id", id);
  if (delErr) throw new Error(delErr.message);

  revalidatePath("/dashboard/businesses");
  redirect("/dashboard/businesses");
}
