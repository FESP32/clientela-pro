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


export async function listReferralParticipants(
  programId: string
): Promise<ReferralParticipantListItem[]> {
  const supabase = await createClient();

  // Current user (merchant/owner)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  // Ensure the current user owns this program
  const { data: program } = await supabase
    .from("referral_program")
    .select("id")
    .eq("id", programId)
    .eq("business_id", business.id)
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
      customer:profile!referral_program_participant_customer_id_fk_profile(name)
    `
    )
    .eq("program_id", programId)
    .order("created_at", { ascending: false })
    .overrideTypes<ReferralParticipantJoinedQuery[]>();

    console.log(error);
    

  if (error || !data) return [];

  return (data ?? []).map(({ customer, ...r }) => ({
    ...r,
    customer_name: customer?.name ?? null,
  })) as ReferralParticipantListItem[];
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


