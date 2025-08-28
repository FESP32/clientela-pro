"use server";

import { GiftIntentRow, GiftRow } from "@/types/gifts";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveBusiness } from "./businesses";

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


export async function claimGiftIntent(formData: FormData) {
  const intent_id = String(formData.get("intent_id") ?? "").trim();
  if (!intent_id) throw new Error("Missing intent_id");

  const supabase = await createClient();

  // Auth
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw new Error(authErr.message);
  if (!user) throw new Error("You must be signed in to claim this gift.");

  // Read to validate & get gift_id for revalidation
  const { data: intent, error: readErr } = await supabase
    .from("gift_intent")
    .select("id, status, expires_at, customer_id, gift_id")
    .eq("id", intent_id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!intent) throw new Error("Gift intent not found.");

  // Must be pending and unassigned
  if (intent.status !== "pending") {
    throw new Error(
      `This gift intent cannot be claimed (status: ${intent.status}).`
    );
  }
  if (intent.customer_id) {
    throw new Error("This gift intent is already assigned.");
  }
  if (intent.expires_at && new Date(intent.expires_at) <= new Date()) {
    throw new Error("This gift intent has expired.");
  }

  // Atomic transition: pending -> consumed (assign to caller)
  const nowIso = new Date().toISOString();
  const { data: updated, error: updErr } = await supabase
    .from("gift_intent")
    .update({
      customer_id: user.id,
      status: "consumed",
      consumed_at: nowIso,
    })
    .eq("id", intent_id)
    .eq("status", "pending")
    .is("customer_id", null)
    .select("id")
    .maybeSingle();

  if (updErr) throw new Error(updErr.message);
  if (!updated)
    throw new Error("Unable to claim this gift intent (it may have changed).");

  // Optional: refresh any pages that show this gift
  revalidatePath(`/dashboard/gifts/${intent.gift_id}`, "page");

  // return {
  //   ok: true as const,
  //   status: "consumed" as const,
  //   intentId: intent_id,
  // };
}

export async function markGiftIntentClaimed(formData: FormData) {
  const intent_id = String(formData.get("intent_id") ?? "").trim();
  if (!intent_id) throw new Error("Missing intent_id");

  const supabase = await createClient();

  // Auth
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw new Error(authErr.message);
  if (!user) throw new Error("You must be signed in.");

  // Read current intent to validate and get gift_id
  const { data: intent, error: readErr } = await supabase
    .from("gift_intent")
    .select("id, status, issuer_id, gift_id")
    .eq("id", intent_id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!intent) throw new Error("Gift intent not found.");

  // Only the issuer (merchant) can mark as claimed
  if (intent.issuer_id !== user.id) {
    throw new Error("Only the issuer can mark this gift as claimed.");
  }

  // Can only move from consumed -> claimed
  if (intent.status !== "consumed") {
    throw new Error(
      `Intent must be 'consumed' to be claimed (got '${intent.status}').`
    );
  }

  // Atomic transition
  const { data: updated, error: updErr } = await supabase
    .from("gift_intent")
    .update({ status: "claimed" })
    .eq("id", intent_id)
    .eq("status", "consumed") // guard against races
    .select("id")
    .maybeSingle();

  if (updErr) throw new Error(updErr.message);
  if (!updated)
    throw new Error("Unable to mark as claimed (it may have changed).");

  // Revalidate relevant pages
  revalidatePath(`/dashboard/gifts/intent/${intent_id}`, "page");
  revalidatePath(`/dashboard/gifts/${intent.gift_id}`, "page");
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
