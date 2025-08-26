import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";
import { ProfileRow } from "./auth";

/** stamp_cards */
export type StampCardRow = Tables<"stamp_card">;
export type StampCardInsert = Inserts<"stamp_card">;
export type StampCardUpdate = Updates<"stamp_card">;

/** stamp_card_products */
export type StampCardProductRow = Tables<"stamp_card_product">;
export type StampCardProductInsert = Inserts<"stamp_card_product">;
export type StampCardProductUpdate = Updates<"stamp_card_product">;

/** stamp_punches */
export type StampPunchRow = Tables<"stamp_punch">;
export type StampPunchInsert = Inserts<"stamp_punch">;
export type StampPunchUpdate = Updates<"stamp_punch">;

/** stamp_intents */
export type StampIntentRow = Tables<"stamp_intent">;
export type StampIntentInsert = Inserts<"stamp_intent">;
export type StampIntentUpdate = Updates<"stamp_intent">;

/** Optional: domain helpers reflecting your CHECK constraint */
export type StampIntentStatus = "pending" | "consumed" | "canceled";

export type StampCardListItem = Pick<
  StampCardRow,
  | "id"
  | "title"
  | "goal_text"
  | "stamps_required"
  | "is_active"
  | "valid_from"
  | "valid_to"
  | "created_at"
  | "updated_at"
> & {
  product_count: number;
};

export type StampCardWithProducts = Pick<
  StampCardRow,
  | "id"
  | "title"
  | "goal_text"
  | "stamps_required"
  | "is_active"
  | "valid_from"
  | "valid_to"
  | "created_at"
  | "updated_at"
> & {
  // stamp_card_products returns an array with product_id only
  stamp_card_products: { product_id: string }[] | null;
};

export type StampIntentWithCustomer = Pick<
  StampIntentRow,
  | "id"
  | "card_id"
  | "business_id"
  | "customer_id"
  | "qty"
  | "status"
  | "note"
  | "expires_at"
  | "consumed_at"
  | "created_at"
  | "updated_at"
> & {
  customer: Pick<ProfileRow, "name"> | null;
};

export type StampIntentListItem = Pick<
  StampIntentRow,
  | "id"
  | "card_id"
  | "business_id"
  | "customer_id"
  | "qty"
  | "status"
  | "note"
  | "expires_at"
  | "consumed_at"
  | "created_at"
  | "updated_at"
> & {
  customer_name: string | null;
};