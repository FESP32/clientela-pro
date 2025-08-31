
"use server";

import { GiftIntentRow, GiftRow } from "@/types/gifts";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
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


export type GiftIntentListItem = {
  id: string;
  status: "pending" | "consumed" | "canceled" | "claimed";
  expires_at: string | null;
  consumed_at: string | null;
  created_at: string;
  gift_id: string;
  gift: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    business: {
      id: string;
      name: string;
      image_url: string | null;
    } | null;
  } | null;
};

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

  if (error) return { data: [], error: error.message };

  return { data: (data as unknown as GiftIntentListItem[]) ?? [] };
}

