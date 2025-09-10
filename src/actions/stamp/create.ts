// app/(dashboard)/stamps/actions.ts
"use server";

import { getBool } from "@/lib/utils";
import { StampCardInsert, StampCardProductInsert } from "@/types/stamps";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import {
  getActiveBusiness,
  getOwnerPlanForBusiness,
  getStampCardCountForBusiness,
} from "@/actions";
import { SubscriptionMetadata } from "@/types/subscription";

export async function createStampCard(formData: FormData) {
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

  const subscriptionMetadata =
    subscriptionPlan.metadata as SubscriptionMetadata;
  const stampCardCount = await getStampCardCountForBusiness(business.id);

  if (stampCardCount >= subscriptionMetadata.max_stamps) {
    console.error("Max Stamp Cards count reached");
    redirect("/dashboard/upgrade");
  }

  const title = String(formData.get("title") ?? "").trim();
  const goal_text = String(formData.get("goal_text") ?? "").trim();
  const stamps_required = Number(formData.get("stamps_required") ?? 0);
  const valid_from = String(formData.get("valid_from") ?? "").trim();
  const valid_to = String(formData.get("valid_to") ?? "").trim();
  const product_ids = formData.getAll("product_ids[]").map(String);

  if (!title) throw new Error("Title is required");
  if (!goal_text) throw new Error("Goal text is required");
  if (!Number.isInteger(stamps_required) || stamps_required < 1 ) {
    throw new Error("Stamps required must be an integer ≥ 1");
  }

  const payload: StampCardInsert = {
    business_id: business?.id,
    title,
    goal_text,
    stamps_required,
    status: "active",
    valid_from: new Date(valid_from).toISOString(),
    valid_to: new Date(valid_to).toISOString(),
  };

  // 1) Create card
  const { data: card, error: cErr } = await supabase
    .from("stamp_card")
    .insert(payload)
    .select("id")
    .single();

  if (cErr) throw new Error(cErr.message);

  // 2) Attach products (if any)
  if (product_ids.length > 0) {
    const rows: StampCardProductInsert[] = product_ids.map((product_id) => ({
      card_id: card.id,
      product_id,
    }));
    const { error: cpErr } = await supabase
      .from("stamp_card_product")
      .insert(rows);
    if (cpErr) throw new Error(cpErr.message);
  }

  // revalidatePath("/dashboard/stamps");
  redirect("/dashboard/stamps");
}

export async function createStampMembership(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const card_id = String(formData.get("card_id") ?? "").trim();

  if (!user) {
    redirect("/login?next=/services/stamps"); // tweak next= as you prefer
  }

  if (!card_id) notFound();

  const { data: card, error: cardErr } = await supabase
    .from("stamp_card")
    .select("id, status, valid_from, valid_to, stamps_required")
    .eq("id", card_id)
    .single();

  if (cardErr || !card) throw new Error("Stamp card not found");
  const now = new Date();
  const startsOk = !card.valid_from || new Date(card.valid_from) <= now;
  const endsOk = !card.valid_to || now <= new Date(card.valid_to);
  if (card.status === "active" || !startsOk || !endsOk) {
    throw new Error("This stamp card is inactive or not currently valid");
  }

  // Upsert membership (unique on card_id + customer_id)
  const { error } = await supabase.from("stamp_punch").upsert({
    card_id,
    customer_id: user.id,
  });

  if (error) throw new Error(error.message);


  redirect(`/services/stamps`); // or `/dashboard/stamps/${card_id}`
}

export async function createStampIntent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const card_id = String(formData.get("card_id") ?? "").trim();
  const qty = Number(formData.get("qty") ?? 1);
  const note = (String(formData.get("note") ?? "").trim() || null) as
    | string
    | null;
  const customer_id_raw = String(formData.get("customer_id") ?? "").trim();
  const customer_id = customer_id_raw ? customer_id_raw : null;
  const expires_at_raw = String(formData.get("expires_at") ?? "").trim();
  const expires_at = expires_at_raw
    ? new Date(expires_at_raw).toISOString()
    : null;

  if (!card_id) throw new Error("Missing card_id");
  if (!Number.isInteger(qty) || qty < 1)
    throw new Error("qty must be a positive integer");

  // Ensure the logged-in user owns this card
  const { data: card, error: cardErr } = await supabase
    .from("stamp_card")
    .select("id, business_id")
    .eq("id", card_id)
    .single();

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  if (cardErr || !card) throw new Error("Card not found");
  if (card.business_id !== business.id)
    throw new Error("Not authorized to create intents for this card");

  // Insert the intent (status defaults to 'pending' in the table)
  const { error: iErr } = await supabase.from("stamp_intent").insert({
    card_id,
    business_id: business.id,
    customer_id, // can be null for open intents
    qty,
    note,
    expires_at, // can be null for no expiry
    status: "pending",
  });

  if (iErr) throw new Error(iErr.message);

  // Refresh the list
  revalidatePath("/dashboard/stamps/");
}
