"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getBool } from "@/lib/utils";
import { ReferralProgramFromFormSchema } from "@/schemas/referrals";
import {
  JoinedReferralProgramWithIntents,
  ReferralIntentListMini,
  ReferralIntentRow,
  ReferralParticipantJoinedQuery,
  ReferralParticipantListItem,
  ReferralProgramInsert,
  ReferralProgramRow,
} from "@/types";
import { getActiveBusiness } from "@/actions";



export async function joinReferralProgram(formData: FormData) {
  const programId = String(formData.get("program_id") ?? "").trim();
  if (!programId) throw new Error("Missing program_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/referrals/${programId}/join`);
  }

  // Check if already a participant
  const { data: existing, error: existingErr } = await supabase
    .from("referral_program_participant")
    .select("id")
    .eq("program_id", programId)
    .eq("customer_id", user!.id)
    .maybeSingle();

  if (existingErr) {
    throw new Error(existingErr.message);
  }

  if (existing) {
    redirect(`/referrals/${programId}?joined=1`);
  }

  // Insert participant
  const { error: insertErr } = await supabase
    .from("referral_program_participant")
    .insert({
      program_id: programId,
      customer_id: user!.id,
    });

  if (insertErr) {
    throw new Error(insertErr.message);
  }

  revalidatePath(`/services/referrals/referrer/${programId}`);
}



export async function joinReferralIntent(formData: FormData) {
  const intentId = String(formData.get("intent_id") ?? "").trim();
  if (!intentId) throw new Error("Missing intent id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/services/referrals/referred/${intentId}`);
  }

  // Look up intent (with program_id)
  const { data: intent, error } = await supabase
    .from("referral_intent")
    .select("id, status, expires_at, referred_id, program_id, referrer_id")
    .eq("id", intentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!intent) throw new Error("Intent not found");
  if (intent.referred_id) throw new Error("Intent already claimed");
  if (intent.status !== "pending") throw new Error("Intent not pending");
  if (intent.expires_at && new Date(intent.expires_at) < new Date()) {
    throw new Error("Intent expired");
  }

  // Mark as consumed
  const { error: updateErr } = await supabase
    .from("referral_intent")
    .update({
      referred_id: user!.id,
      status: "consumed",
      consumed_at: new Date().toISOString(),
    })
    .eq("id", intentId);

  if (updateErr) throw new Error(updateErr.message);

  revalidatePath(`/services/referrals//${intent.id}`);
}


export async function markIntentClaimed(formData: FormData) {
  const intentId = String(formData.get("intent_id") ?? "").trim();
  if (!intentId) throw new Error("Missing intent id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch intent
  const { data: intent, error } = await supabase
    .from("referral_intent")
    .select("id, status, program_id, referrer_id, referred_id")
    .eq("id", intentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!intent) throw new Error("Intent not found");

  // Only allow moving forward (pending→claimed OR consumed→claimed)
  if (intent.status === "claimed") {
    return; // already done
  }
  if (intent.status !== "pending" && intent.status !== "consumed") {
    throw new Error(`Cannot claim from status: ${intent.status}`);
  }

  // (optional) restrict consumed→claimed to referrer only
  if (intent.status === "consumed" && intent.referrer_id !== user.id) {
    throw new Error("Only the referrer can finalize this referral.");
  }

  const { error: updErr } = await supabase
    .from("referral_intent")
    .update({
      status: "claimed",
    })
    .eq("id", intentId);

  if (updErr) throw new Error(updErr.message);

  const { data: part } = await supabase
    .from("referral_program_participant")
    .select("id, referred_qty")
    .eq("program_id", intent.program_id)
    .eq("customer_id", intent.referrer_id)
    .maybeSingle();

  if (part) {
    const { error: uErr } = await supabase
      .from("referral_program_participant")
      .update({ referred_qty: (part.referred_qty ?? 0) + 1 })
      .eq("id", part.id);
    if (uErr) throw new Error(uErr.message);
  }

  revalidatePath(`/dashboard/referral/intent/${intentId}/claim`);
  revalidatePath(`/referrals/${intent.program_id}`);
}



