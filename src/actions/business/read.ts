"use server"

import { createClient } from "@/utils/supabase/server";
import { BusinessDetail, BusinessWithMembership } from "@/types/business";

export async function listMyBusinesses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return {
      error: "You must be signed in.",
      data: [] as BusinessWithMembership[],
    };

  const { data, error } = await supabase
    .from("business")
    .select(
      `
      id, name, image_url, description, is_active, created_at,
      membership:business_user!inner!business_user_business_id_fk(
        user_id, role, created_at
      )
    `
    )
    .eq("membership.user_id", user.id)
    .order("name", { ascending: true })
    .overrideTypes<BusinessWithMembership[]>();

  console.log(error);
  

  if (error) {
    return { error, data: [] as BusinessWithMembership[] };
  }

  return { error: null, data };
}

export async function getActiveBusiness() {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { business: null, role: null, set_at: null as string | null };
  }

  // Look up user's active business id
  const { data: activeRow, error: activeErr } = await supabase
    .from("business_current")
    .select("business_id, set_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (activeErr) throw new Error(activeErr.message);
  if (!activeRow) {
    return { business: null, role: null, set_at: null as string | null };
  }

  // Fetch the business (RLS will ensure the user can read it)
  const { data: business, error: bizErr } = await supabase
    .from("business")
    .select(
      "id, owner_id, name, description, website_url, instagram_url, facebook_url, image_url, image_path, is_active, created_at, updated_at"
    )
    .eq("id", activeRow.business_id)
    .maybeSingle();

  if (bizErr) throw new Error(bizErr.message);
  if (!business) {
    // Could be filtered by RLS or deleted
    return { business: null, role: null, set_at: null as string | null };
  }

  // Find explicit membership role (if any)
  const { data: membership, error: memErr } = await supabase
    .from("business_user")
    .select("role")
    .eq("business_id", business.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memErr) throw new Error(memErr.message);

  const role =
    membership?.role ??
    (business.owner_id === user.id ? ("owner" as const) : null);

  return { business, role, set_at: activeRow.set_at as string };
}

export async function getBusinessDetail(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business")
    .select(
      `
      id, name, image_url, description, is_active, created_at,

      owner:profile!business_owner_id_fk_profile (
        user_id, name
      ),

      members:business_user!business_user_business_id_fk (
        user_id, role, created_at,
        profile:profile!business_user_user_id_fk_profile ( user_id, name )
      )
    `
    )
    .eq("id", businessId)
    .single()
    .overrideTypes<BusinessDetail>();

  if (error) throw error;
  return data;
}

