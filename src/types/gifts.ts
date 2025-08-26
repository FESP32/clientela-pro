import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";

export type GiftRow = Tables<"gift">;
export type GiftInsert = Inserts<"gift">;
export type GiftUpdate = Updates<"gift">;


export type GiftIntentRow = Tables<"gift_intent">;
export type GiftIntentInsert = Inserts<"gift_intent">;
export type GiftIntentUpdate = Updates<"gift_intent">;

