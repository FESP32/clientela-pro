import { Inserts, Tables, Updates } from "@/utils/supabase/helpers";

export type BusinessRow = Tables<"businesses">;
export type BusinessInsert = Inserts<"businesses">;
export type BusinessUpdate = Updates<"businesses">;
