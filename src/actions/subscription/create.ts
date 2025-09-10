// app/actions/billing.ts (or /actions/billing.ts depending on your setup)
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Resend } from "resend";

export async function requestPlanUpgrade(formData: FormData): Promise<void> {
  const planCode = String(formData.get("plan_code") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!planCode) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return;
  }

  // Look up the plan name by code (keeps the form simple & trustworthy)
  const { data: plan } = await supabase
    .from("subscription_plan")
    .select("code, name")
    .eq("code", planCode)
    .eq("is_active", true)
    .maybeSingle();

  
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = 'fesp321@gmail.com';
  const from = "Clientela Pro <onboarding@resend.dev>";

  const planLabel = plan ? `${plan.name} (${plan.code})` : planCode;

  const { error } =await resend.emails.send({
    from,
    to,
    subject: `Upgrade request: ${planLabel}`,
    text: [
      `User: ${user.email}`,
      `User ID: ${user.id}`,
      `Requested plan: ${planLabel}`,
      note ? `Note: ${note}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    console.log(error);
  }else {
    redirect("/dashboard/upgrade?sent=1");
  }

}
