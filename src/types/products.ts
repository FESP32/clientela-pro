import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";
export type ProductRow = Tables<"product">;
export type ProductInsert = Inserts<"product">;
export type ProductUpdate = Updates<"product">;
