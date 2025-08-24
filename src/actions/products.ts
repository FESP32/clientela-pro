"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProductSchema } from "@/schemas/products";
import { Database } from "@/types/database.types";
import { BusinessRow } from "@/types/business";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business, error: bizErr } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Pick<BusinessRow, "id">>();

  if (bizErr) {
    throw new Error(bizErr.message);
  }
  if (!business) {
    throw new Error(
      "You don’t have an active business. Create/activate one first."
    );
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
  const { error } = await supabase.from("products").insert({
    owner_id: user.id,
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

   const { data: business, error: bizErr } = await supabase
     .from("businesses")
     .select("id")
     .eq("owner_id", user.id)
     .eq("is_active", true)
     .order("created_at", { ascending: true })
     .limit(1)
     .maybeSingle<Pick<BusinessRow, "id">>();

  if (bizErr) {
    throw new Error(bizErr.message);
  }
  if (!business) {
    throw new Error(
      "You don’t have an active business. Create/activate one first."
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select<"id, owner_id, business_id, name, metadata, created_at, updated_at">()
    .eq("owner_id", user.id)
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
    .from("products")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/products");
}
