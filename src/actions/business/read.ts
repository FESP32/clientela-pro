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
  const { data: currentRow, error: currentErr } = await supabase
    .from("business_current")
    .select("business_id, set_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentErr) throw new Error(currentErr.message);
  if (!currentRow) {
    return { business: null, role: null, set_at: null as string | null };
  }

  // Fetch the business (RLS will ensure the user can read it)
  const { data: business, error: bizErr } = await supabase
    .from("business")
    .select(
      "id, owner_id, name, description, website_url, instagram_url, facebook_url, image_url, image_path, is_active, created_at, updated_at"
    )
    .eq("id", currentRow.business_id)
    .maybeSingle();

  if (bizErr) throw new Error(bizErr.message);
  if (!business || !business.is_active) {
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

  return { business, role, set_at: currentRow.set_at as string };
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

export async function getMyOwnedBusinessCount(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error("Not authenticated");
  }

  const { count, error } = await supabase
    .from("business")
    .select("id", { head: true, count: "exact" })
    .eq("owner_id", user.id);

  if (error) {
    throw new Error(`Failed to count businesses: ${error.message}`);
  }

  return count ?? 0;
}

