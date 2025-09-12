"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ProductSchema } from "@/schemas/products";
import {
  getActiveBusiness,
  getOwnerPlanForBusiness,
  getProductCountForBusiness,
} from "@/actions";
import { SubscriptionMetadata } from "@/types/subscription";

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

  const subscriptionPlan = await getOwnerPlanForBusiness(business.id);

  const subscriptionMetadata = subscriptionPlan.metadata as SubscriptionMetadata;
  const productCount = await getProductCountForBusiness(business.id);

  if (productCount >= subscriptionMetadata.max_products) {
    revalidatePath("/dashboard/stamps");
    return { success: false, message: "Max product count reached" };
  }

  const parsed = ProductSchema.safeParse({
    name: formData.get("name") ?? "",
    business_id: business.id,
    metadata: (formData.get("metadata") as string) ?? "",
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(", ");
    return { success: false, message: msg};
  }

  const { name, metadata, business_id } = parsed.data;

  // 3) Insert product
  const { error } = await supabase.from("product").insert({
    business_id,
    name,
    metadata, // already a JSON object from the schema’s transform
  });

  if (error) {
    return { success: false, message: error.message };
  }

  
  revalidatePath("/dashboard/products");
  return { success: true, message: "Product created successfully" };
}
