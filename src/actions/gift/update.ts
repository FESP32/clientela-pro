"use server";

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


  console.log( 'user',user.id);
  
  
  const { error: updErr } = await supabase
    .from("gift_intent")
    .update({
      customer_id: user!.id,
      status: "consumed",
      consumed_at: new Date().toISOString(),
    })
    .eq("id", intent_id);

  if (updErr) console.log(JSON.stringify(updErr));

  revalidatePath(`/dashboard/gifts/${intent.gift_id}`, "page");
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

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  // Read current intent to validate and get gift_id
  const { data: intent, error: readErr } = await supabase
    .from("gift_intent")
    .select("id, status, gift_id, business_id")
    .eq("id", intent_id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!intent) throw new Error("Gift intent not found.");

  if (intent.business_id !== business.id) {
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
  

  // Revalidate relevant pages
  revalidatePath(`/dashboard/gifts/intent/${intent_id}`, "page");
  revalidatePath(`/dashboard/gifts/${intent.gift_id}`, "page");
}
