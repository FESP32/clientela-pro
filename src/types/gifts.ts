import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";

export type GiftRow = Tables<"gift">;
export type GiftInsert = Inserts<"gift">;
export type GiftUpdate = Updates<"gift">;
