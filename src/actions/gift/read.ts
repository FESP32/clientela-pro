
"use server";

import { GiftIntentDashboardView, GiftIntentListItem, GiftIntentRow, GiftIntentView, GiftRow } from "@/types/gifts";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getActiveBusiness } from "@/actions";

export async function listGifts() {
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

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  // fetch gifts for current owner
  const { data, error } = await supabase
    .from("gift")
    .select("id, title, business_id, description, image_url, created_at, updated_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .overrideTypes<GiftRow[]>();

  return {
    user: { id: user.id, email: user.email },
    gifts: data ?? [],
    error: error?.message ?? null,
  };
}

export async function listGiftIntents(giftId: string): Promise<{
  user: { id: string } | null;
  gift: GiftRow | null;
  intents: GiftIntentRow[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr)
    return { user: null, gift: null, intents: [], error: authErr.message };
  if (!user) return { user: null, gift: null, intents: [] };

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { data: gift, error: gErr } = await supabase
    .from("gift")
    .select("id, business_id, title, description, image_url, created_at")
    .eq("id", giftId)
    .eq("business_id", business.id)
    .maybeSingle<GiftRow>();

  if (gErr) return { user, gift: null, intents: [], error: gErr.message };
  if (!gift) return { user, gift: null, intents: [], error: "Gift not found" };

  // Intents with customer name (LEFT JOIN)
  const { data: intents, error: iErr } = await supabase
    .from("gift_intent")
    .select(
      `
      id,
      status,
      created_at,
      expires_at,
      consumed_at,
      customer_id
    `
    )
    .eq("gift_id", giftId)
    .order("created_at", { ascending: false })
    .overrideTypes<GiftIntentRow[]>();

  console.log(iErr);

  if (iErr) return { user, gift, intents: [], error: iErr.message };

  return { user, gift, intents };
}

export async function listMyGiftIntents(): Promise<{
  data: GiftIntentListItem[];
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) return { data: [], error: authErr.message };
  if (!user) return { data: [], error: "You must be signed in." };

  const { data, error } = await supabase
    .from("gift_intent")
    .select(
      `
      id, status, expires_at, consumed_at, created_at, gift_id,
      gift:gift(
        id, title, description, image_url,
        business:business(
          id, name, image_url
        )
      )
    `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  console.log(data);
  

  if (error) return { data: [], error: error.message };

  return { data: (data as unknown as GiftIntentListItem[]) ?? [] };
}

export async function getGiftIntent(intentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gift_intent")
    .select(
      `
      id, status, created_at, expires_at, consumed_at,
      gift:gift (
        id, title, description,
        business!gift_business_id_fk ( id, name, image_url )
      ),
      customer:profile!gift_intent_customer_id_fk_profile ( user_id, name )
    `
    )
    .eq("id", intentId)
    .maybeSingle();
  if (error || !data) {
    return { ok: false as const, message: error?.message ?? "Not found" };
  }

  return { ok: true as const, intent: data as GiftIntentView };
}

export async function getGiftIntentForDashboard(intentId: string) {
  const supabase = await createClient();

  // who am I (for ownership/CTA rendering)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load intent with gift, business, and customer
  const { data, error } = await supabase
    .from("gift_intent")
    .select(
      `
      id, status, expires_at, consumed_at, created_at, business_id, gift_id, customer_id,
      gift:gift!gift_intent_gift_id_fk (
        id, title, description, image_url
      ),
      business:business!gift_intent_business_id_fk (
        id, name, image_url, owner_id
      ),
      customer:profile!gift_intent_customer_id_fk_profile (
        user_id, name
      )
    `
    )
    .eq("id", intentId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    userId: user?.id ?? null,
    intent: (data as GiftIntentDashboardView | null) ?? null,
  };
}

export async function getGiftCountForBusiness(
  businessId: string
): Promise<number> {
  if (!businessId) throw new Error("businessId is required");

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("gift")
    .select("id", { head: true, count: "exact" })
    .eq("business_id", businessId);

  if (error) throw new Error(`Failed to count gifts: ${error.message}`);
  return count ?? 0;
}