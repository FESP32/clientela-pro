import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";
export type ProductRow = Tables<"products">;
export type ProductInsert = Inserts<"products">;
export type ProductUpdate = Updates<"products">;
