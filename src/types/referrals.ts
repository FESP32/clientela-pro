import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";

/** referral_program */
export type ReferralProgramRow = Tables<"referral_program">;
export type ReferralProgramInsert = Inserts<"referral_program">;
export type ReferralProgramUpdate = Updates<"referral_program">;

/** referral_program_participant */
export type ReferralParticipantRow = Tables<"referral_program_participant">;
export type ReferralParticipantInsert = Inserts<"referral_program_participant">;
export type ReferralParticipantUpdate = Updates<"referral_program_participant">;

/** referral_intents */
export type ReferralIntentRow = Tables<"referral_intents">;
export type ReferralIntentInsert = Inserts<"referral_intents">;
export type ReferralIntentUpdate = Updates<"referral_intents">;

/** Optional: domain helpers reflecting your CHECK constraint */
export type ReferralIntentStatus =
  | "pending"
  | "consumed"
  | "canceled"
  | "claimed";

/** Flat list item: participant row + resolved customer name */
export type ReferralParticipantListItem = ReferralParticipantRow & {
  customer_name: string | null;
};

/** Internal shape returned by the join query (before flattening) */
export type ReferralParticipantJoinedQuery = ReferralParticipantRow & {
  // Use `null` if you keep a LEFT join; remove `| null` if you use !inner
  customer: { name: string | null } | null;
};

/** New: participant + claimed intents count */
export type ReferralParticipantWithCounts = ReferralParticipantListItem & {
  claimed_intents_count: number;
};

export type ReferralIntentListMini = Pick<
  ReferralIntentRow,
  "id" | "status" | "referred_id" | "expires_at" | "created_at" | "consumed_at"
>;

/** Programs joined with when the current user joined and their intents in that program */
export type JoinedReferralProgramWithIntents = {
  id: string;
  title: string;
  code: string;
  is_active: boolean;
  referrer_reward: string | null;
  referred_reward: string | null;
  valid_from: string | null; // timestamptz
  valid_to: string | null; // timestamptz
  joined_at: string; // timestamptz from referral_program_participant.created_at
  intents: ReferralIntentListMini[];
};
