"use server";

import { createClient } from "@/utils/supabase/server";
import type {  Tables } from "@/types/database.types";

type PlanT = Tables<"subscription_plan">;
type PlanPick = Pick<
  PlanT,
  | "id"
  | "code"
  | "name"
  | "description"
  | "price_month"
  | "price_year"
  | "currency"
  | "metadata"
>;

export async function getOwnerPlanForBusiness(
  businessId: string
): Promise<PlanPick> {
  const supabase = await createClient();

  // 1) Fetch owner of the business
  const { data: biz, error: bizErr } = await supabase
    .from("business")
    .select("owner_id")
    .eq("id", businessId)
    .maybeSingle();

  if (bizErr) throw new Error(`Failed to load business: ${bizErr.message}`);
  if (!biz) throw new Error("Business not found or not accessible.");

  // 2) Owner's active subscription -> just the plan
  const { data: subWithPlan, error: subErr } = await supabase
    .from("subscription")
    .select<string, { plan: PlanPick }>(
      `
      plan:subscription_plan(
        id, code, name, description, price_month, price_year, currency, metadata
      )
    `
    )
    .eq("user_id", biz.owner_id)
    .eq("status", "active")
    .is("expires_at", null)
    .maybeSingle();

  if (subErr) throw new Error(`Failed to load subscription: ${subErr.message}`);

  if (subWithPlan?.plan) {
    return subWithPlan.plan;
  }

  // 3) Fallback: Free plan
  const { data: freePlan, error: freeErr } = await supabase
    .from("subscription_plan")
    .select<string, PlanPick>(
      "id, code, name, description, price_month, price_year, currency, metadata"
    )
    .eq("code", "free")
    .eq("is_active", true)
    .maybeSingle();

  if (freeErr || !freePlan) {
    throw new Error(
      `Free plan not found${freeErr ? `: ${freeErr.message}` : ""}`
    );
  }

  return freePlan;
}

export async function getMyPlan(): Promise<PlanPick> {
  const supabase = await createClient();

  // Must be logged in
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error("Not authenticated");
  }

  // Active subscription (self) → just the plan
  const { data: subWithPlan, error: subErr } = await supabase
    .from("subscription")
    .select<string, { plan: PlanPick }>(
      `
      plan:subscription_plan(
        id, code, name, description, price_month, price_year, currency, metadata
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .is("expires_at", null)
    .maybeSingle();

  if (subErr) {
    throw new Error(`Failed to load subscription: ${subErr.message}`);
  }
  if (subWithPlan?.plan) return subWithPlan.plan;

  // Fallback: Free plan
  const { data: freePlan, error: freeErr } = await supabase
    .from("subscription_plan")
    .select<string, PlanPick>(
      "id, code, name, description, price_month, price_year, currency, metadata"
    )
    .eq("code", "free")
    .eq("is_active", true)
    .maybeSingle();

  if (freeErr || !freePlan) {
    throw new Error(
      `Free plan not found${freeErr ? `: ${freeErr.message}` : ""}`
    );
  }

  return freePlan;
}
