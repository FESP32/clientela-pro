"use server";

import { GiftIntentRow, GiftRow } from "@/types/gifts";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveBusiness } from "@/actions";

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

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { error } = await supabase.from("gift").insert({
    business_id: business?.id,
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

export async function createGiftIntent(formData: FormData) {
  const gift_id = String(formData.get("gift_id") ?? "").trim();
  const expires_at_raw = String(formData.get("expires_at") ?? "").trim();
  const customer_id_raw = String(formData.get("customer_id") ?? "").trim();
  const qty = Math.max(1, Number(formData.get("qty") ?? 1));

  if (!gift_id) throw new Error("Missing gift_id");

  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw new Error(authErr.message);
  if (!user) throw new Error("Not authenticated");

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  // Ensure the gift belongs to the caller
  const { data: gift, error: gErr } = await supabase
    .from("gift")
    .select("id, business_id")
    .eq("id", gift_id)
    .eq("business_id", business.id)
    .maybeSingle();
  if (gErr) throw new Error(gErr.message);
  if (!gift) throw new Error("Gift not found or not owned by you");

  const expires_at = expires_at_raw
    ? new Date(expires_at_raw).toISOString()
    : null;
  const customer_id = customer_id_raw || null;

  // Create N rows (qty). If you prefer an RPC/bulk insert, swap this.
  const rows = Array.from({ length: qty }, () => ({
    gift_id,
    issuer_id: user.id,
    customer_id,
    status: "pending" as const,
    expires_at,
  }));

  const { error: insertErr } = await supabase.from("gift_intent").insert(rows);
  if (insertErr) throw new Error(insertErr.message);

  revalidatePath(`/dashboard/gifts/${gift_id}`);
}