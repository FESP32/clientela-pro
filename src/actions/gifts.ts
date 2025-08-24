"use server";

import { GiftRow } from "@/types/gifts";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGift(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const image_url = String(formData.get("image_url") ?? "").trim() || null;

  if (!title) {
    throw new Error("Title is required.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/gifts/new");
  }

  const { error } = await supabase.from("gift").insert({
    owner_id: user.id,
    customer_id: null, // assigned later
    title,
    description,
    image_url,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Update any listings that show gifts
  revalidatePath("/dashboard/gifts");
  redirect("/dashboard/gifts?created=1");
}

export async function listMerchantGifts(): Promise<{
  user: { id: string; email?: string | null } | null;
  gifts: GiftRow[];
  error: string | null;
}> {
  const supabase = await createClient();

  // who am I?
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    return { user: null, gifts: [], error: userErr.message };
  }
  if (!user) {
    return { user: null, gifts: [], error: null };
  }

  // fetch gifts for current owner
  const { data, error } = await supabase
    .from("gift")
    .select(
      "id, title, description, image_url, customer_id, created_at, updated_at"
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return {
    user: { id: user.id, email: user.email },
    gifts: (data ?? []) as GiftRow[],
    error: error?.message ?? null,
  };
}
