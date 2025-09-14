// app/profile/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import SignOut from "@/components/auth/sign-out";
import { ProfileRow } from "@/types/auth";
import {
  Crown,
  User as UserIcon,
  ArrowLeft,
  CalendarClock,
} from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Profile
  const { data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .eq("user_id", user.id)
    .single<ProfileRow>();

  if (error || !profile) {
    return (
      <div className="mx-auto mt-10 max-w-xl px-6">
        <div className="relative rounded-2xl p-[1px]">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-500/20 via-transparent to-transparent opacity-70 blur-xl" />
          <Card className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 rounded-2xl [background:radial-gradient(90%_70%_at_10%_-10%,hsl(var(--foreground)/0.06),transparent_60%)]" />
            <CardHeader className="flex items-center justify-between gap-3">
              <CardTitle>Profile</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/services">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Services
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Couldn’t load your profile.{" "}
                {error?.message ?? "Please try again."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isMerchant = (profile.user_type ?? "").toLowerCase() === "merchant";

  // Only fetch subscription when user is a merchant
  let subscription: {
    id: string;
    user_id: string;
    status: string;
    interval: string;
    started_at: string | null;
    expires_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    subscription_plan: {
      id: string;
      code: string;
      name: string;
      description: string | null;
      price_month: number;
      price_year: number;
      currency: string;
    } | null;
  } | null = null;

  let plan: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    price_month: number;
    price_year: number;
    currency: string;
  } | null = null;

  if (isMerchant) {
    const { data: maybeSub } = await supabase
      .from("subscription")
      .select(
        `
        id,
        user_id,
        status,
        interval,
        started_at,
        expires_at,
        created_at,
        updated_at,
        subscription_plan:plan_id (
          id, code, name, description, price_month, price_year, currency
        )
      `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .is("expires_at", null)
      .maybeSingle();

    subscription = maybeSub ?? null;

    // Prefer joined plan; fallback to free if no active subscription
    plan = subscription?.subscription_plan ?? null;

    if (!plan) {
      const { data: freePlan } = await supabase
        .from("subscription_plan")
        .select(
          "id, code, name, description, price_month, price_year, currency"
        )
        .eq("code", "free")
        .maybeSingle();
      plan = freePlan ?? null;
    }
  }

  const joined = profile.created_at
    ? format(new Date(profile.created_at), "PPP")
    : "—";
  const initial = (
    profile.name?.trim()?.[0] ??
    user.email?.trim()?.[0] ??
    "U"
  )?.toUpperCase();

  // Subscription display values (only meaningful for merchants)
  const subStatus = subscription?.status ?? "none";
  const interval = subscription?.interval ?? "month";
  const isActive = subStatus === "active";
  const price =
    plan && interval === "year"
      ? Number(plan.price_year ?? 0)
      : Number(plan?.price_month ?? 0);
  const currency = plan?.currency ?? "USD";
  const periodText = isActive
    ? `Renews every ${interval}`
    : subscription?.expires_at
    ? `Ends ${format(new Date(subscription.expires_at), "PPP")}`
    : "—";

  return (
    <div className="mx-auto mt-10 max-w-xl px-6">
      <div className="group relative rounded-2xl p-[1px]">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/25 via-transparent to-transparent opacity-80 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

        <Card className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl transition-all duration-300 group-hover:shadow-lg">
          <div className="pointer-events-none absolute inset-0 rounded-2xl [background:radial-gradient(90%_70%_at_10%_-10%,hsl(var(--foreground)/0.06),transparent_60%)]" />

          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-foreground/5 ring-1 ring-foreground/10">
                  <UserIcon
                    className="h-5 w-5 text-foreground/70"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{initial}</span>
                </div>
                <CardTitle className="leading-tight">
                  {profile.name ?? user.email ?? "Your Profile"}
                </CardTitle>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <Link href="/services">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Services
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile back button */}
            <div className="mt-2 sm:hidden">
              <Button asChild variant="ghost" size="sm" className="-ml-2">
                <Link href="/services">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Services
                </Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm">{profile.name ?? "—"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">User Type</p>
                <p className="text-sm">{profile.user_type ?? "—"}</p>
              </div>
            </div>

            <Separator />

            {/* Subscription (merchants only) */}
            {isMerchant && plan ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 text-sm font-medium">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        Subscription
                      </span>
                      {plan?.name ? (
                        <Badge variant="secondary" className="ml-1">
                          {plan.name}
                        </Badge>
                      ) : null}
                    </div>

                    {isActive ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/billing">Manage</Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/billing/upgrade">Upgrade</Link>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm capitalize">
                        {isActive ? "active" : "free"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interval</p>
                      <p className="text-sm capitalize">
                        {isActive ? interval : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Billing</p>
                      <p className="text-sm">
                        {currency} ${price.toFixed(2)}
                        {isActive ? ` / ${interval}` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Renewal</p>
                      <p className="text-sm inline-flex items-center gap-1">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        {periodText}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="text-[13px] break-all font-mono">
                  {profile.user_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-[13px]">{joined}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between flex-col md:flex-row">
            <SignOut />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
