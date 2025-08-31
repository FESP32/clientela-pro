// app/(dashboard)/stamps/actions.ts
"use server";

import { getBool } from "@/lib/utils";
import {
  PunchesGroupedByCard,
  PunchWithCardBusiness,
  StampCardInsert,
  StampCardListItem,
  StampCardProductInsert,
  StampCardRow,
  StampCardWithProducts,
  StampIntentListItem,
  StampIntentRow,
  StampIntentWithCustomer,
} from "@/types/stamps";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActiveBusiness } from "@/actions";

export async function deleteStampCard(formData: FormData): Promise<void> {
  const cardId = formData.get("cardId") as string;
  if (!cardId) throw new Error("Missing cardId");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { business } = await getActiveBusiness();
  if (!business) {
    redirect("/dashboard/businesses/missing");
  }

  const { error } = await supabase
    .from("stamp_card")
    .delete()
    .eq("id", cardId)
    .eq("business_id", business.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/stamps");
}
