"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProductSchema } from "@/schemas/products";
import { ProductRow } from "@/types/products";

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Validate inputs
  const parsed = ProductSchema.safeParse({
    name: formData.get("name") ?? "",
    metadata: (formData.get("metadata") as string) ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    // You can return instead of throwing if you want to render errors on the same page
    throw new Error(msg);
  }

  const { name, metadata } = parsed.data;

  const { error } = await supabase
    .from("products")
    .insert({ owner_id: user.id, name, metadata });

  if (error) {
    throw new Error(error.message);
  }

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

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("owner_id", user.id)
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
    .from("products")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}
