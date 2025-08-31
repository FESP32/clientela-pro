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
