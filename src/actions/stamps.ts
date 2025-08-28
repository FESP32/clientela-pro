// app/(dashboard)/stamps/actions.ts
"use server";

import { getBool } from "@/lib/utils";
import {
  PunchesGroupedByCard,
  PunchWithCardBusiness,
  StampCardInsert,
  StampCardListItem,
  StampCardProductInsert,
  StampCardRow,
  StampCardWithProducts,
  StampIntentListItem,
  StampIntentRow,
  StampIntentWithCustomer,
} from "@/types/stamps";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveBusiness } from "./businesses";

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

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const payload: StampCardInsert = {
    business_id: business?.id,
    title,
    goal_text,
    stamps_required,
    is_active,
    valid_from: valid_from ? new Date(valid_from).toISOString() : null,
    valid_to: valid_to ? new Date(valid_to).toISOString() : null,
  };

  // 1) Create card
  const { data: card, error: cErr } = await supabase
    .from("stamp_card")
    .insert(payload)
    .select("id")
    .single();

  if (cErr) throw new Error(cErr.message);

  // 2) Attach products (if any)
  if (product_ids.length > 0) {
    const rows: StampCardProductInsert[] = product_ids.map((product_id) => ({
      card_id: card.id,
      product_id,
    }));
    const { error: cpErr } = await supabase
      .from("stamp_card_product")
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

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  // Pull cards and related products (to compute product_count)
  const { data, error } = await supabase
    .from("stamp_card")
    .select(
      `
      id, business_id, title, goal_text, stamps_required, is_active,
      valid_from, valid_to, created_at, updated_at,
      stamp_card_product ( product_id )
    `
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .overrideTypes<StampCardWithProducts[]>();

  if (error) {
    return { user, cards: [], error: error.message };
  }

  const cards: StampCardListItem[] = (data ?? []).map((row) => ({
    ...row,
    product_count: Array.isArray(row.stamp_card_product)
      ? row.stamp_card_product.length
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

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { error } = await supabase
    .from("stamp_card")
    .delete()
    .eq("id", cardId)
    .eq("business_id", business.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/stamps");
}

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

  // Insert punch
  const { error: pErr } = await supabase.from("stamp_punch").insert({
    card_id,
    customer_id,
    qty: qtyNum,
    note,
  });

  if (pErr) throw new Error(pErr.message);
  
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
    .from("stamp_card")
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
  const { error } = await supabase.from("stamp_punch").upsert({
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
    .from("stamp_card")
    .select(
      "id, business_id, title, goal_text, stamps_required, is_active, valid_from, valid_to, created_at, updated_at"
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
    .from("stamp_punch")
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
    .from("stamp_card")
    .select("id, business_id")
    .eq("id", card_id)
    .single();

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  if (cardErr || !card) throw new Error("Card not found");
  if (card.business_id !== business.id)
    throw new Error("Not authorized to create intents for this card");

  // Insert the intent (status defaults to 'pending' in the table)
  const { error: iErr } = await supabase.from("stamp_intent").insert({
    card_id,
    business_id: business.id,
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

export async function listStampIntents(cardId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      card: null as { id: string; title: string } | null,
      intents: [] as StampIntentListItem[],
      error: null as string | null,
    };
  }

  // Ensure the card exists (id, title, business_id)
  const { data: card, error: cardErr } = await supabase
    .from("stamp_card")
    .select("id, title, business_id")
    .eq("id", cardId)
    .maybeSingle()
    .overrideTypes<Pick<StampCardRow, "id" | "title" | "business_id"> | null>();

  if (cardErr || !card) {
    return {
      user,
      card: null,
      intents: [],
      error: cardErr?.message ?? "Card not found",
    };
  }

  // Get the user's active business and authorize
  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  if (card.business_id !== business!.id) {
    return {
      user,
      card: null,
      intents: [],
      error: "Not authorized to view intents for this card",
    };
  }

  // Fetch intents; left-join customer profile name (optional)
  const { data, error } = await supabase
    .from("stamp_intent")
    .select(
      `
      id,
      card_id,
      business_id,
      customer_id,
      qty,
      status,
      note,
      expires_at,
      consumed_at,
      created_at,
      updated_at,
      customer:profile!stamp_intent_customer_id_fk_profile ( name )
    `
    )
    .eq("card_id", cardId)
    .eq("business_id", business!.id)
    .order("created_at", { ascending: false })
    .overrideTypes<StampIntentWithCustomer[]>();

  if (error) {
    return {
      user,
      card: null,
      intents: [],
      error: error.message,
    };
  }

  // Flatten customer name
  const intents: StampIntentListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    card_id: row.card_id,
    business_id: row.business_id,
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
export async function consumeStampIntent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const intent_id = String(formData.get("intent_id") ?? "").trim();
  const redirect_to =
    String(formData.get("redirect_to") ?? "").trim() ||
    (intent_id ? `/stamps/intents/${intent_id}` : "/stamps");

  // Hard block: must be logged in
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(redirect_to)}`);
  }

  if (!intent_id) throw new Error("Missing intent_id");

  // ...rest of your existing logic...
  const { data: intent, error: iErr } = await supabase
    .from("stamp_intent")
    .select("id, card_id, business_id, customer_id, qty, status, expires_at")
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
    .from("stamp_intent")
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

  const { error: punchErr } = await supabase.from("stamp_punch").insert({
    card_id: updated.card_id,
    customer_id: updated.customer_id!,
    qty: updated.qty,
    note: `intent:${updated.id}`,
  });

  if (punchErr) {
    await supabase
      .from("stamp_intent")
      .update({ status: "pending", consumed_at: null })
      .eq("id", updated.id)
      .eq("status", "consumed");
    throw new Error(punchErr.message);
  }

  revalidatePath(`/stamps/${updated.card_id}`);
  revalidatePath(`/stamps`);
  revalidatePath(`/dashboard/loyalty/cards/${updated.card_id}/intents`);
  redirect(`/services/stamps/${updated.card_id}`);
}

export async function getStampIntent(intentId: string) {
  const supabase = await createClient();

  // Fetch user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      intent: null,
      error: userError?.message ?? "Not found",
    };
  }

  // Fetch intent
  const { data: intent, error: intentError } = await supabase
    .from("stamp_intent")
    .select(
      `
      id, card_id, business_id, customer_id, qty, status, note, expires_at, consumed_at, created_at,
      card:stamp_card(id, title, stamps_required, is_active, valid_from, valid_to)
    `
    )
    .eq("id", intentId)
    .single();

  if (intentError || !intent) {
    return {
      user,
      intent: null,
      error: intentError?.message ?? "Not found",
    };
  }

  return { user, intent, error: null as string | null };
}

export async function listLatestStamps(limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stamp_card")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching stamp cards:", error.message);
    return [];
  }

  return data ?? [];
}

export async function listMyStampPunches(): Promise<PunchWithCardBusiness[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("stamp_punch")
    .select(
      `
      id, qty, note, created_at,
      card:stamp_card!stamp_punch_card_id_fk(
        id, title, stamps_required,
        business:business!stamp_card_business_id_fk(id, name, image_url)
      )
    `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .overrideTypes<PunchWithCardBusiness[]>();

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listMyStampPunchesGroupedInCode(): Promise<
  PunchesGroupedByCard[]
> {
  const punches = await listMyStampPunches();

  const map = new Map<string, PunchesGroupedByCard>();

  for (const p of punches) {
    if (!p.card) continue;
    const key = p.card.id;

    const stampsRequired = Math.max(1, p.card.stamps_required ?? 1);

    if (!map.has(key)) {
      map.set(key, {
        card: {
          id: p.card.id,
          title: p.card.title,
          stamps_required: stampsRequired,
        },
        business: p.card.business
          ? {
              id: p.card.business.id,
              name: p.card.business.name ?? null,
              image_url: p.card.business.image_url ?? null,
            }
          : null,
        total_qty: 0,
        last_at: null,
        pct: 0,
        punches: [],
      });
    }

    const agg = map.get(key)!;
    agg.total_qty += p.qty ?? 0;
    agg.last_at =
      !agg.last_at || new Date(p.created_at) > new Date(agg.last_at)
        ? p.created_at
        : agg.last_at;

    agg.punches.push({
      id: p.id,
      qty: p.qty,
      note: p.note,
      created_at: p.created_at,
    });

    const clamped = Math.min(agg.total_qty, stampsRequired);
    agg.pct = Math.round((clamped / stampsRequired) * 100);
  }

  // Sort by most recent activity
  const result = Array.from(map.values()).sort((a, b) => {
    const ta = a.last_at ? +new Date(a.last_at) : 0;
    const tb = b.last_at ? +new Date(b.last_at) : 0;
    return tb - ta;
  });

  return result;
}
