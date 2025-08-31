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

export async function createReferralProgram(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Parse form input (same style as createSurvey)
  const parsed = ReferralProgramFromFormSchema.safeParse({
    title: formData.get("title"),
    code: formData.get("code"),
    is_active: formData.get("is_active") ?? "true",
    referrer_reward: formData.get("referrer_reward") ?? "",
    referred_reward: formData.get("referred_reward") ?? "",
    valid_from: formData.get("valid_from") ?? "",
    valid_to: formData.get("valid_to") ?? "",
    per_referrer_cap: formData.get("per_referrer_cap") ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(msg || "Invalid input");
  }

  const {
    title,
    code,
    is_active,
    referrer_reward,
    referred_reward,
    valid_from,
    valid_to,
    per_referrer_cap,
  } = parsed.data;

  // Optional: basic range check (DB can also enforce)
  if (valid_from && valid_to && valid_to <= valid_from) {
    throw new Error("End date must be later than start date.");
  }

  const { business } = await getActiveBusiness();

  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const insertPayload: ReferralProgramInsert = {
    business_id: business?.id,
    title,
    code,
    is_active: is_active ?? getBool(formData, "is_active"),
    referrer_reward: referrer_reward || null,
    referred_reward: referred_reward || null,
    valid_from: valid_from ? valid_from.toISOString() : null,
    valid_to: valid_to ? valid_to.toISOString() : null,
    per_referrer_cap, // null => unlimited, else number
  };

  const { error } = await supabase
    .from("referral_program")
    .insert(insertPayload);
  if (error) {
    // Handle composite unique (owner_id, code) violation gracefully
    // Postgres code 23505 = unique_violation (Supabase surfaces it in error.code)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === "23505") {
      throw new Error("That code is already used in your account.");
    }
    throw new Error(error.message || "Failed to create referral program");
  }

  revalidatePath("/dashboard/referrals");
  redirect("/dashboard/referrals");
}

export async function createReferralParticipant(formData: FormData) {
  const programId = String(formData.get("program_id") ?? "");
  if (!programId) throw new Error("Missing program_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/referrals/${programId}/join`);

  // Already a participant?
  const { data: existing, error: selErr } = await supabase
    .from("referral_program_participant")
    .select("id")
    .eq("program_id", programId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);

  if (!existing) {
    const { error: insErr } = await supabase
      .from("referral_program_participant")
      .insert({ program_id: programId, customer_id: user.id });

    if (insErr) throw new Error(insErr.message);
  }

  revalidatePath(`/referrals/${programId}`);
  redirect(`/referrals/${programId}?joined=1`);
}

export async function createReferralIntent(formData: FormData) {
  const programId = String(formData.get("program_id") ?? "").trim();
  const expiresAtRaw = String(formData.get("expires_at") ?? "").trim() || null;

  if (!programId) throw new Error("Missing program_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/referrals/${programId}/join`);
  }

  // Ensure current user is a participant of this program (referrer)
  const { data: participant, error: partErr } = await supabase
    .from("referral_program_participant")
    .select("id")
    .eq("program_id", programId)
    .eq("customer_id", user!.id)
    .maybeSingle();
  if (partErr) throw new Error(partErr.message);
  if (!participant)
    throw new Error("You must join this program before creating invites.");

  // Validate program state
  const { data: program, error: progErr } = await supabase
    .from("referral_program")
    .select("is_active, valid_from, valid_to")
    .eq("id", programId)
    .maybeSingle();
  if (progErr) throw new Error(progErr.message);
  if (!program) throw new Error("Program not found.");
  if (!program.is_active) throw new Error("Program is inactive.");

  const now = new Date();
  if (program.valid_from && new Date(program.valid_from) > now) {
    throw new Error("Program is not yet active.");
  }
  if (program.valid_to && new Date(program.valid_to) < now) {
    throw new Error("Program has expired.");
  }

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null;

  const { error: insertErr } = await supabase.from("referral_intent").insert({
    program_id: programId,
    referrer_id: user!.id,
    referred_id: null, // always null in this simplified panel
    status: "pending",
    expires_at: expiresAt,
  });
  if (insertErr) throw new Error(insertErr.message);

  revalidatePath(`/referrals/${programId}`);
  // Also revalidate the join page where this panel lives
  revalidatePath(`/referrals/${programId}/join`);
}


