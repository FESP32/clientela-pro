import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";

/** stamp_cards */
export type StampCardRow = Tables<"stamp_cards">;
export type StampCardInsert = Inserts<"stamp_cards">;
export type StampCardUpdate = Updates<"stamp_cards">;

/** stamp_card_products */
export type StampCardProductRow = Tables<"stamp_card_products">;
export type StampCardProductInsert = Inserts<"stamp_card_products">;
export type StampCardProductUpdate = Updates<"stamp_card_products">;

/** stamp_punches */
export type StampPunchRow = Tables<"stamp_punches">;
export type StampPunchInsert = Inserts<"stamp_punches">;
export type StampPunchUpdate = Updates<"stamp_punches">;

/** stamp_intents */
export type StampIntentRow = Tables<"stamp_intents">;
export type StampIntentInsert = Inserts<"stamp_intents">;
export type StampIntentUpdate = Updates<"stamp_intents">;

/** Optional: domain helpers reflecting your CHECK constraint */
export type StampIntentStatus = "pending" | "consumed" | "canceled";

export type StampCardListItem = Pick<
  StampCardRow,
  | "id"
  | "owner_id"
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
  | "owner_id"
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

export type StampIntentListItem = StampIntentRow & {
  customer_name: string | null;
};

export type StampIntentWithCustomer = Omit<
  StampIntentRow,
  never
> & {
  customer: { name: string | null } | null;
};
