"use server";

import { GiftIntentRow, GiftRow } from "@/types/gifts";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveBusiness } from "@/actions";

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
