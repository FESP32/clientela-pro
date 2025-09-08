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
import { Crown, User as UserIcon, ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  const joined = profile.created_at
    ? format(new Date(profile.created_at), "PPP")
    : "—";
  const planIsPremium = profile.subscription_plan === "premium";
  const initial = (
    profile.name?.trim()?.[0] ??
    user.email?.trim()?.[0] ??
    "U"
  )?.toUpperCase();

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
                <Badge
                  variant={planIsPremium ? "default" : "secondary"}
                  className="gap-1.5"
                >
                  {planIsPremium && <Crown className="h-3.5 w-3.5" />}
                  {planIsPremium ? "Premium" : "Free"}
                </Badge>
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

          <CardFooter className="flex justify-between">
            <Button asChild variant="ghost" size="sm" className="sm:hidden">
              <Link href="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Link>
            </Button>
            <SignOut />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
