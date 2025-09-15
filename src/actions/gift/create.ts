"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import {
  getActiveBusiness,
  getGiftCountForBusiness,
  getOwnerPlanForBusiness,
} from "@/actions";
import { SubscriptionMetadata } from "@/types/subscription";

export async function createGift(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

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

  const subscriptionPlan = await getOwnerPlanForBusiness(business.id);

  const subscriptionMetadata =
    subscriptionPlan.metadata as SubscriptionMetadata;
  const surveyCount = await getGiftCountForBusiness(business.id);

  if (surveyCount >= subscriptionMetadata.max_gifts) {
    return {
      success: false,
      message: "Max gift count reached",
    };
  }

  const { error } = await supabase.from("gift").insert({
    business_id: business?.id,
    title,
    description
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }
  
  revalidatePath("/dashboard/gifts");

  return {
    success: true,
    message: "Gift created successfuly",
  };
  
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
  if (!gift) notFound();

  const expires_at = expires_at_raw
    ? new Date(expires_at_raw).toISOString()
    : null;
  const customer_id = customer_id_raw || null;

  // Create N rows (qty). If you prefer an RPC/bulk insert, swap this.
  const rows = Array.from({ length: qty }, () => ({
    gift_id,
    business_id: business.id,
    customer_id,
    status: "pending" as const,
    expires_at,
  }));

  const { error: insertErr } = await supabase.from("gift_intent").insert(rows);
  if (insertErr) {
    return {
      success: false,
      message: "Error creating gift intent(s)",
    };
  };

  revalidatePath(`/dashboard/gifts/${gift_id}`);

  return {
    success: true,
    message: "Gift intent(s) created successfully",
  };
}
