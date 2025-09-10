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
import { getActiveBusiness } from "@/actions";

export async function listStampCards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      cards: [] as StampCardListItem[],
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
      id, business_id, title, goal_text, stamps_required, status,
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
      "id, business_id, title, goal_text, stamps_required, status, valid_from, valid_to, created_at, updated_at"
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
      card:stamp_card(id, title, stamps_required, status, valid_from, valid_to)
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
        id, title, stamps_required, status,
        business:business!stamp_card_business_id_fk(id, name, image_url)
      )
    `
    )
    .eq("customer_id", user.id)
    .eq("card.status", "active")
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


export async function getStampCardCountForBusiness(
  businessId: string
): Promise<number> {
  if (!businessId) throw new Error("businessId is required");

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("stamp_card")
    .select("id", { head: true, count: "exact" })
    .eq("business_id", businessId);

  if (error) throw new Error(`Failed to count stamp cards: ${error.message}`);
  return count ?? 0;
}


