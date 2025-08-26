"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProductSchema } from "@/schemas/products";
import { BusinessRow } from "@/types/business";
import { getActiveBusiness } from "./businesses";
import { ProductRow } from "@/types/products";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { business } = await getActiveBusiness();

  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  // 2) Validate inputs (inject business_id resolved above)
  const parsed = ProductSchema.safeParse({
    name: formData.get("name") ?? "",
    business_id: business.id,
    metadata: (formData.get("metadata") as string) ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    throw new Error(msg);
  }

  const { name, metadata, business_id } = parsed.data;

  // 3) Insert product
  const { error } = await supabase.from("product").insert({
    business_id,
    name,
    metadata, // already a JSON object from the schema’s transform
  });

  if (error) {
    throw new Error(error.message);
  }

  // 4) Refresh list + go back
  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function listProducts() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      products: [] as ProductRow[],
      error: null as null | string,
    };
  }

  const { business } = await getActiveBusiness();

  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { data, error } = await supabase
    .from("product")
    .select(
      "id, business_id, name, metadata, created_at, updated_at"
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return {
    user,
    products: (data ?? []) as ProductRow[],
    error: error?.message ?? null,
  };
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Missing product id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // RLS should allow delete only for the owner; the extra filter is a safety belt.
  const { error } = await supabase
    .from("product")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}
