"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProductSchema } from "@/schemas/products";
import { getActiveBusiness } from "@/actions";
import { ProductRow } from "@/types/products";

export async function listProducts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      data: [] as ProductRow[],
      error: null as null | string,
    };
  }

  const { business } = await getActiveBusiness();

  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { data, error } = await supabase
    .from("product")
    .select("id, business_id, name, metadata, created_at, updated_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return {
    user,
    data: (data ?? []) as ProductRow[],
    error: error?.message ?? null,
  };
}
