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
  ReferralParticipantRow,
  ReferralProgramInsert,
  ReferralProgramRow,
} from "@/types";
import { getActiveBusiness } from "./businesses";

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

export async function listReferralPrograms() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Not logged in → return empty list (or throw/redirect in the page)
    return [];
  }

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { data, error } = await supabase
    .from("referral_program")
    .select(
      `
      id,
      business_id,
      title,
      code,
      is_active,
      referrer_reward,
      referred_reward,
      valid_from,
      valid_to,
      created_at,
      updated_at
    `
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .overrideTypes<ReferralProgramRow[]>();

  if (error) {
    // Surface as empty (or throw – up to you)
    return [];
  }

  return data ?? [];
}

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

export async function listJoinedReferralProgramsWithIntents(): Promise<
  JoinedReferralProgramWithIntents[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 1) Which programs has the current user joined as a participant?
  const { data: memberships, error: mErr } = await supabase
    .from("referral_program_participant")
    .select("program_id, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (mErr || !memberships?.length) return [];

  const programIds = memberships.map((m) => m.program_id);
  const joinedAtMap = new Map<string, string>(
    memberships.map((m) => [m.program_id, m.created_at as string])
  );

  // 2) Fetch those programs
  const { data: programs, error: pErr } = await supabase
    .from("referral_program")
    .select(
      "id, title, code, is_active, referrer_reward, referred_reward, valid_from, valid_to"
    )
    .in("id", programIds);

  if (pErr || !programs?.length) return [];

  // 3) Fetch the current user's intents for those programs (as the referrer)
  const { data: intents, error: iErr } = await supabase
    .from("referral_intent")
    .select(
      "id, program_id, status, referred_id, expires_at, created_at, consumed_at"
    )
    .in("program_id", programIds)
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  if (iErr) {
    // Intents are optional; if this fails, still return programs the user joined
    // You could also throw, depending on your UX.
  }

  // 4) Group intents by program
  const intentsByProgram = new Map<string, ReferralIntentListMini[]>();
  (intents ?? []).forEach((it) => {
    const arr = intentsByProgram.get(it.program_id) ?? [];
    arr.push({
      id: it.id,
      status: it.status,
      referred_id: it.referred_id ?? null,
      expires_at: it.expires_at ?? null,
      created_at: it.created_at,
      consumed_at: it.consumed_at ?? null,
    });
    intentsByProgram.set(it.program_id, arr);
  });

  // 5) Build joined rows
  const rows: JoinedReferralProgramWithIntents[] = programs.map((p) => ({
    id: p.id,
    title: p.title,
    code: p.code,
    is_active: p.is_active,
    referrer_reward: p.referrer_reward ?? null,
    referred_reward: p.referred_reward ?? null,
    valid_from: p.valid_from ?? null,
    valid_to: p.valid_to ?? null,
    joined_at: joinedAtMap.get(p.id)!,
    intents: intentsByProgram.get(p.id) ?? [],
  }));

  // 6) Sort by newest join
  rows.sort((a, b) => +new Date(b.joined_at) - +new Date(a.joined_at));

  return rows;
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

export async function listReferralParticipants(
  programId: string
): Promise<ReferralParticipantListItem[]> {
  const supabase = await createClient();

  // Current user (merchant/owner)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Ensure the current user owns this program
  const { data: program } = await supabase
    .from("referral_program")
    .select("id")
    .eq("id", programId)
    .eq("owner_id", user.id)
    .maybeSingle()
    .overrideTypes<Pick<ReferralProgramRow, "id">>();

  if (!program) return [];

  // Fetch participants + profile names
  const { data, error } = await supabase
    .from("referral_program_participant")
    .select(
      `
      id,
      program_id,
      customer_id,
      referred_qty,
      note,
      created_at,
      customer:profiles!referral_program_participant_customer_id_fkey(name)
    `
    )
    .eq("program_id", programId)
    .order("created_at", { ascending: false })
    .overrideTypes<ReferralParticipantJoinedQuery[]>();

  if (error || !data) return [];

  return (data ?? []).map(({ customer, ...r }) => ({
    ...r,
    customer_name: customer?.name ?? null,
  }));
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

export type ProgramJoinData =
  | {
      ok: true;
      userId: string | null;
      program: Pick<
        ReferralProgramRow,
        | "id"
        | "title"
        | "code"
        | "is_active"
        | "referrer_reward"
        | "referred_reward"
        | "valid_from"
        | "valid_to"
        | "per_referrer_cap"
      >;
      participantCount: number;
      alreadyJoined: boolean;
    }
  | { ok: false; message: string };

export async function getProgramJoinData(
  programId: string
): Promise<ProgramJoinData> {
  const supabase = await createClient();

  // Who's the current user?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Program
  const { data: program, error: progErr } = await supabase
    .from("referral_program")
    .select(
      `
      id, title, code, is_active,
      referrer_reward, referred_reward,
      valid_from, valid_to, per_referrer_cap
    `
    )
    .eq("id", programId)
    .maybeSingle();

  if (progErr) return { ok: false, message: progErr.message };
  if (!program) return { ok: false, message: "Program not found" };

  // Participants count
  const { count: participantCountRaw } = await supabase
    .from("referral_program_participant")
    .select("id", { count: "exact", head: true })
    .eq("program_id", programId);

  // Already joined?
  let alreadyJoined = false;
  if (user) {
    const { data: existing } = await supabase
      .from("referral_program_participant")
      .select("id")
      .eq("program_id", programId)
      .eq("customer_id", user.id)
      .maybeSingle();
    alreadyJoined = !!existing;
  }

  return {
    ok: true,
    userId: user?.id ?? null,
    program,
    participantCount: participantCountRaw ?? 0,
    alreadyJoined,
  };
}

export async function listMyProgramReferralIntents(
  programId: string,
  limit = 20
): Promise<ReferralIntentListMini[]> {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Intents for this program created by current user (referrer)
  const { data, error } = await supabase
    .from("referral_intent")
    .select("id, status, created_at, expires_at, consumed_at, referred_id")
    .eq("program_id", programId)
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<ReferralIntentRow[]>();

  if (error || !data) return [];

  // Ensure it matches ReferralIntentListMini exactly
  return data;
}

export type ProgramReferralCap = {
  /** NULL => unlimited */
  cap: number | null;
  /** Successful referrals attributed to the current referrer (participant.referred_qty) */
  referredQty: number;
  /** NULL => unlimited */
  remaining: number | null;
  /** true when remaining === 0 and cap !== null */
  reachedCap: boolean;
  /** Participant row id if present (may be useful) */
  participantId: string | null;
};

export type ProgramIntentQuota = {
  /** Program-provided quantity (NULL => unlimited) */
  cap: number | null;
  /** Number of intents the current user has created for this program */
  createdIntents: number;
  /** Remaining you can still create (NULL => unlimited) */
  remainingCreatable: number | null;
  /** True when createdIntents >= cap (and cap !== null) */
  reachedCap: boolean;
};

/**
 * Computes the user's intent-creation quota for a program:
 *   createdIntents / per_referrer_cap
 * If not authenticated or the program doesn’t exist, returns null.
 *
 * NOTE: counts *all* intents created by the user for the program regardless of status.
 * If you prefer to count only "pending" ones, add `.eq("status","pending")` below.
 */
export async function getMyProgramIntentQuota(
  programId: string
): Promise<ProgramIntentQuota | null> {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Read cap from program
  const { data: prog } = await supabase
    .from("referral_program")
    .select("per_referrer_cap")
    .eq("id", programId)
    .maybeSingle();
  if (!prog) return null;

  const cap =
    typeof prog.per_referrer_cap === "number" ? prog.per_referrer_cap : null;

  // Count intents *created* by this user for this program
  const { count } = await supabase
    .from("referral_intent")
    .select("id", { head: true, count: "exact" })
    .eq("program_id", programId)
    .eq("referrer_id", user.id);
  // .eq("status","pending") // <- uncomment if you only want pending

  const createdIntents = count ?? 0;

  const remainingCreatable =
    cap === null ? null : Math.max(0, cap - createdIntents);
  const reachedCap = cap !== null && createdIntents >= cap;

  return { cap, createdIntents, remainingCreatable, reachedCap };
}
