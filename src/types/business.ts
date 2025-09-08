import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";
import { ProfileRow } from "./auth";

export type BusinessRow = Tables<"business">;
export type BusinessInsert = Inserts<"business">;
export type BusinessUpdate = Updates<"business">;

/* ──────────────── Business Users ──────────────── */
export type BusinessUserRow = Tables<"business_user">;
export type BusinessUserInsert = Inserts<"business_user">;
export type BusinessUserUpdate = Updates<"business_user">;

/* ──────────────── Active Business ──────────────── */
export type BusinessActiveRow = Tables<"business_current">;
export type BusinessActiveInsert = Inserts<"business_current">;
export type BusinessActiveUpdate = Updates<"business_current">;

/* ──────────────── Business Invites ──────────────── */
export type BusinessInviteRow = Tables<"business_invite">;
export type BusinessInviteInsert = Inserts<"business_invite">;
export type BusinessInviteUpdate = Updates<"business_invite">;

export type BusinessWithMembership = Pick<
  BusinessRow,
  "id" | "image_url" | "name" | "description" | "is_active" | "created_at"
> & {
  membership: Array<Pick<BusinessUserRow, "user_id" | "role" | "created_at">>;
};

export type BusinessMember = Pick<
  BusinessUserRow,
  "user_id" | "role" | "created_at"
> & {
  profile: Pick<ProfileRow, "user_id" | "name"> | null;
};

export type BusinessDetail = Pick<
  BusinessRow,
  "id" | "image_url" |  "name" | "description" | "is_active" | "created_at"
> & {
  owner: Pick<ProfileRow, "user_id" | "name"> | null;
  members: BusinessMember[];
};


