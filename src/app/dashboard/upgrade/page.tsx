// app/dashboard/billing/upgrade/page.tsx  (or place under your route of choice)
import Link from "next/link";
import { Crown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { requestPlanUpgrade } from "@/actions"; // action below
import UpgradeSonnerGate from "@/components/dashboard/upgrade/upgrade-sonner-gate";

export const dynamic = "force-dynamic";

export default async function UpgradePromptPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load active plans (code + name as requested)
  const { data: plans, error } = await supabase
    .from("subscription_plan")
    .select("code,name")
    .eq("is_active", true)
    .order("price_month", { ascending: true }); // stable order if you have price

  // Auth guard (simple, premium, no animations)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6">
        <div className="p-6 rounded-full bg-primary/10">
          <Crown className="w-20 h-20 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Upgrade your plan</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You need to sign in to request an upgrade.
        </p>
        <Button asChild>
          <Link href="/login?next=/dashboard/billing/upgrade">Sign in</Link>
        </Button>
      </div>
    );
  }

  // If plans load failed or none found
  if (error || !plans?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6">
        <div className="p-6 rounded-full bg-primary/10">
          <Crown className="w-20 h-20 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Upgrade your plan</h1>
        <p className="text-muted-foreground text-center max-w-md">
          We couldn’t load plans right now. Please try again later.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-6 my-16">
      <div className="p-6 rounded-full bg-primary/10">
        <Crown className="w-20 h-20 text-primary" />
      </div>

      <h1 className="text-2xl font-bold">Upgrade your plan</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Choose a package and we’ll notify our team to get you set up.
      </p>

      {/* Minimal, premium form (server action) */}
      <form action={requestPlanUpgrade} className="w-full max-w-md space-y-4">
        {/* Show who is requesting (read-only, premium text line) */}
        <div className="text-sm text-muted-foreground">
          Requesting as{" "}
          <span className="font-medium text-foreground">{user.email}</span>
        </div>

        {/* Native select keeps this fully server-side */}
        <div className="space-y-2">
          <label htmlFor="plan_code" className="text-sm font-medium">
            Select plan
          </label>
          <select
            id="plan_code"
            name="plan_code"
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Choose a plan…
            </option>
            {plans.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            We use your selection to prepare the upgrade.
          </p>
        </div>

        {/* Optional note for context */}
        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-medium">
            Note (optional)
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            placeholder="Team size, start date, or anything else you’d like us to know…"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back</Link>
          </Button>

          <Button type="submit" className="inline-flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send request
          </Button>
        </div>
      </form>
      <UpgradeSonnerGate />
    </div>
  );
}
