// app/(dashboard)/stamps/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type StampCardRow = {
  id: string;
  owner_id: string;
  title: string;
  goal_text: string;
  stamps_required: number;
  is_active: boolean;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
};

function getBool(fd: FormData, name: string) {
  const v = fd.get(name);
  return v === "true" || v === "on" || v === "1";
}

export async function getOwnerProducts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []) as { id: string; name: string }[];
}

export async function createStampCard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const goal_text = String(formData.get("goal_text") ?? "").trim();
  const stamps_required = Number(formData.get("stamps_required") ?? 0);
  const is_active = getBool(formData, "is_active");
  const valid_from = String(formData.get("valid_from") ?? "").trim();
  const valid_to = String(formData.get("valid_to") ?? "").trim();
  const product_ids = formData.getAll("product_ids[]").map(String);

  if (!title) throw new Error("Title is required");
  if (!goal_text) throw new Error("Goal text is required");
  if (!Number.isInteger(stamps_required) || stamps_required < 1) {
    throw new Error("Stamps required must be an integer ≥ 1");
  }

  // 1) Create card
  const { data: card, error: cErr } = await supabase
    .from("stamp_cards")
    .insert({
      owner_id: user.id,
      title,
      goal_text,
      stamps_required,
      is_active,
      valid_from: valid_from ? new Date(valid_from).toISOString() : null,
      valid_to: valid_to ? new Date(valid_to).toISOString() : null,
    })
    .select("id")
    .single();

  if (cErr) throw new Error(cErr.message);

  // 2) Attach products (if any)
  if (product_ids.length > 0) {
    const rows = product_ids.map((pid) => ({
      card_id: card!.id,
      product_id: pid,
    }));
    const { error: cpErr } = await supabase
      .from("stamp_card_products")
      .insert(rows);
    if (cpErr) throw new Error(cpErr.message);
  }

  revalidatePath("/dashboard/stamps");
  redirect("/dashboard/stamps");
}

export async function listStampCards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      cards: [] as StampCardRow[],
      error: null as string | null,
    };
  }

  // Pull cards and related products (to compute product_count)
  const { data, error } = await supabase
    .from("stamp_cards")
    .select(
      `
      id, owner_id, title, goal_text, stamps_required, is_active,
      valid_from, valid_to, created_at, updated_at,
      stamp_card_products ( product_id )
    `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { user, cards: [], error: error.message };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cards: StampCardRow[] = (data ?? []).map((row: any) => ({
    ...row,
    product_count: Array.isArray(row.stamp_card_products)
      ? row.stamp_card_products.length
      : 0,
  }));

  return { user, cards, error: null as string | null };
}

export async function deleteStampCard(cardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("stamp_cards")
    .delete()
    .eq("id", cardId)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/stamps");
}

/**
 * Punch a stamp card for a customer.
 * Expects form fields: card_id, customer_id, qty (optional, default 1), note (optional).
 */
export async function punchStampCard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const card_id = String(formData.get("card_id") ?? "").trim();
  const customer_id = String(formData.get("customer_id") ?? "").trim();
  const qtyNum = Number(formData.get("qty") ?? 1);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!card_id) throw new Error("Missing card_id");
  if (!customer_id) throw new Error("Missing customer_id");
  if (!Number.isFinite(qtyNum) || qtyNum < 1) {
    throw new Error("qty must be a positive integer");
  }

  // Optional: ensure the authenticated user owns the card
  const { data: card, error: cardErr } = await supabase
    .from("stamp_cards")
    .select("id, owner_id")
    .eq("id", card_id)
    .single();

  if (cardErr || !card) throw new Error("Card not found");
  if (card.owner_id !== user.id)
    throw new Error("Not authorized to punch this card");

  // Insert punch
  const { error: pErr } = await supabase.from("stamp_punches").insert({
    card_id,
    customer_id,
    qty: qtyNum,
    note,
  });

  if (pErr) throw new Error(pErr.message);

  // Revalidate the list and (optionally) a detail page if you have one
  revalidatePath("/dashboard/stamps");
  // revalidatePath(`/dashboard/stamps/${card_id}`); // if you create a detail page later
}

// CREATE a membership instance for the logged-in customer
export async function createStampMembership(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/stamps"); // tweak next= as you prefer
  }

  const card_id = String(formData.get("card_id") ?? "").trim();
  if (!card_id) throw new Error("Missing card_id");

  // Optional: validate card is active and within validity window
  const { data: card, error: cardErr } = await supabase
    .from("stamp_cards")
    .select("id, is_active, valid_from, valid_to, stamps_required")
    .eq("id", card_id)
    .single();

  if (cardErr || !card) throw new Error("Stamp card not found");
  const now = new Date();
  const startsOk = !card.valid_from || new Date(card.valid_from) <= now;
  const endsOk = !card.valid_to || now <= new Date(card.valid_to);
  if (!card.is_active || !startsOk || !endsOk) {
    throw new Error("This stamp card is inactive or not currently valid");
  }

  // Upsert membership (unique on card_id + customer_id)
  const { error } = await supabase.from("stamp_punches").upsert({
    card_id,
    customer_id: user.id,
  });

  if (error) throw new Error(error.message);

  // Revalidate whatever list/detail you show
  revalidatePath("/dashboard/stamps");
  redirect(`/dashboard/stamps`); // or `/dashboard/stamps/${card_id}`
}

export async function getCustomerStampCard(cardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      card: null,
      membership: null,
      error: null as string | null,
    };
  }

  // Card
  const { data: card, error: cErr } = await supabase
    .from("stamp_cards")
    .select(
      "id, owner_id, title, goal_text, stamps_required, is_active, valid_from, valid_to, created_at, updated_at"
    )
    .eq("id", cardId)
    .single();

  if (cErr || !card) {
    return {
      user,
      card: null,
      membership: null,
      error: cErr?.message ?? "Not found",
    };
  }

  // Punches (ONLY qty and created_at)
  const { data: punches, error: pErr } = await supabase
    .from("stamp_punches")
    .select("qty, created_at")
    .eq("card_id", cardId)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: true });

  if (pErr) {
    return { user, card, membership: null, error: pErr.message };
  }

  const rows = punches ?? [];
  if (rows.length === 0) {
    // No punches yet -> no instance
    return { user, card, membership: null, error: null as string | null };
  }

  // Use qty directly
  const totalQty = rows.reduce((sum, r) => sum + (r.qty ?? 0), 0);
  const last_punched_at = rows.at(-1)?.created_at ?? null;
  const completed_at =
    typeof card.stamps_required === "number" && totalQty >= card.stamps_required
      ? last_punched_at
      : null;

  // Shape what the page uses: membership.qty and membership.completed_at
  const membership = {
    qty: totalQty,
    completed_at,
    last_punched_at,
  };

  return { user, card, membership, error: null as string | null };
}

export async function createStampIntent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const card_id = String(formData.get("card_id") ?? "").trim();
  const qty = Number(formData.get("qty") ?? 1);
  const note = (String(formData.get("note") ?? "").trim() || null) as
    | string
    | null;
  const customer_id_raw = String(formData.get("customer_id") ?? "").trim();
  const customer_id = customer_id_raw ? customer_id_raw : null;
  const expires_at_raw = String(formData.get("expires_at") ?? "").trim();
  const expires_at = expires_at_raw
    ? new Date(expires_at_raw).toISOString()
    : null;

  if (!card_id) throw new Error("Missing card_id");
  if (!Number.isInteger(qty) || qty < 1)
    throw new Error("qty must be a positive integer");

  // Ensure the logged-in user owns this card
  const { data: card, error: cardErr } = await supabase
    .from("stamp_cards")
    .select("id, owner_id")
    .eq("id", card_id)
    .single();

  if (cardErr || !card) throw new Error("Card not found");
  if (card.owner_id !== user.id)
    throw new Error("Not authorized to create intents for this card");

  // Insert the intent (status defaults to 'pending' in the table)
  const { error: iErr } = await supabase.from("stamp_intents").insert({
    card_id,
    merchant_id: user.id,
    customer_id, // can be null for open intents
    qty,
    note,
    expires_at, // can be null for no expiry
    status: "pending",
  });

  if (iErr) throw new Error(iErr.message);

  // Refresh the list
  revalidatePath("/dashboard/stamps/");
}

// List all stamp intents for a given card owned by the logged-in merchant
export type StampIntentRow = {
  id: string;
  card_id: string;
  merchant_id: string;
  customer_id: string | null;
  qty: number;
  status: "pending" | "consumed" | "canceled";
  note: string | null;
  expires_at: string | null;
  consumed_at: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string | null; // from profiles (if present)
};

export async function listStampIntents(cardId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      card: null,
      intents: [] as StampIntentRow[],
      error: null as string | null,
    };
  }

  // Ensure the card exists and is owned by the current merchant
  const { data: card, error: cardErr } = await supabase
    .from("stamp_cards")
    .select("id, title, owner_id")
    .eq("id", cardId)
    .single();

  if (cardErr || !card) {
    return {
      user,
      card: null,
      intents: [],
      error: cardErr?.message ?? "Card not found",
    };
  }
  if (card.owner_id !== user.id) {
    return {
      user,
      card: null,
      intents: [],
      error: "Not authorized to view intents for this card",
    };
  }

  // Fetch intents; left-join customer profile name (optional)
  const { data, error } = await supabase
    .from("stamp_intents")
    .select(
      `
      id, card_id, merchant_id, customer_id, qty, status, note,
      expires_at, consumed_at, created_at, updated_at
    `
    )
    .eq("card_id", cardId)
    .eq("merchant_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { user, card, intents: [], error: error.message };
  }

  // Shape rows (flatten customer name)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const intents: StampIntentRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    card_id: row.card_id,
    merchant_id: row.merchant_id,
    customer_id: row.customer_id ?? null,
    qty: row.qty,
    status: row.status,
    note: row.note ?? null,
    expires_at: row.expires_at ?? null,
    consumed_at: row.consumed_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    customer_name: row.customer?.name ?? null,
  }));

  return {
    user,
    card: { id: card.id, title: card.title },
    intents,
    error: null as string | null,
  };
}

// Consume a stamp intent: links it to the current user (if open), marks it consumed, and records punches.
// in @/app/dashboard/stamps/actions.ts
export async function consumeStampIntent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const intent_id = String(formData.get("intent_id") ?? "").trim();
  const redirect_to =
    String(formData.get("redirect_to") ?? "").trim() ||
    (intent_id ? `/stamps/intents/${intent_id}` : "/stamps");

  // 🚫 Hard block: must be logged in
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirect_to)}`);
  }

  if (!intent_id) throw new Error("Missing intent_id");

  // ...rest of your existing logic...
  const { data: intent, error: iErr } = await supabase
    .from("stamp_intents")
    .select("id, card_id, merchant_id, customer_id, qty, status, expires_at")
    .eq("id", intent_id)
    .single();

  if (iErr || !intent) throw new Error("Intent not found");
  if (intent.status !== "pending")
    throw new Error(`Intent is ${intent.status}, cannot be consumed`);
  if (intent.expires_at && new Date(intent.expires_at) <= new Date())
    throw new Error("Intent expired");
  if (intent.customer_id && intent.customer_id !== user!.id) {
    throw new Error("This intent is reserved for another customer");
  }

  const consumedAt = new Date().toISOString();
  const { data: updated, error: upErr } = await supabase
    .from("stamp_intents")
    .update({
      status: "consumed",
      consumed_at: consumedAt,
      customer_id: intent.customer_id ?? user!.id,
    })
    .eq("id", intent.id)
    .eq("status", "pending")
    .select("id, card_id, customer_id, qty")
    .single();

  if (upErr || !updated)
    throw new Error("Could not consume intent (maybe already processed)");

  const { error: punchErr } = await supabase.from("stamp_punches").insert({
    card_id: updated.card_id,
    customer_id: updated.customer_id!,
    qty: updated.qty,
    note: `intent:${updated.id}`,
  });

  if (punchErr) {
    await supabase
      .from("stamp_intents")
      .update({ status: "pending", consumed_at: null })
      .eq("id", updated.id)
      .eq("status", "consumed");
    throw new Error(punchErr.message);
  }

  revalidatePath(`/stamps/${updated.card_id}`);
  revalidatePath(`/stamps`);
  revalidatePath(`/dashboard/loyalty/cards/${updated.card_id}/intents`);
  redirect(`services/stamps/${updated.card_id}`);
}
