"use client";

import Link from "next/link";
import {
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MailCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm leading-6">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

export default function ReferralsHomePage() {
  return (
    <div className="min-h-screen px-6 pb-24 pt-10 flex items-start justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Grow with referrals</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Referrals
          </h1>

          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Join with an invite you received, or create & share your own link to
            invite others and earn rewards.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Referred */}
          <div className="group relative rounded-2xl p-[1px]">
            {/* gradient glow on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/25 via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            <Card className="relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
              {/* subtle light sweep */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(80%_60%_at_10%_-10%,hsl(var(--foreground)/0.06),transparent_60%)]" />

              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="inline-grid place-items-center h-8 w-8 rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                    <MailCheck className="h-4 w-4" />
                  </span>
                  I have an invite
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Redeem a referral you received from a friend or business.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Bullet>Paste or scan a referral link/QR to continue</Bullet>
                  <Bullet>Preview rewards before you accept</Bullet>
                  <Bullet>Track your referral status anytime</Bullet>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link
                      href="/services/referrals/referred"
                      aria-label="Continue as Referred"
                    >
                      Continue as Referred
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <p className="pt-1 text-xs text-muted-foreground">
                  Tip: If you already have a URL, you can open it directly.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referrer */}
          <div className="group relative rounded-2xl p-[1px]">
            {/* gradient glow on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            <Card className="relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-background/60 shadow-sm backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lg">
              {/* subtle light sweep */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(80%_60%_at_10%_-10%,hsl(var(--foreground)/0.06),transparent_60%)]" />

              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="inline-grid place-items-center h-8 w-8 rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                    <UserPlus className="h-4 w-4" />
                  </span>
                  I’m a referrer
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a personal referral link and share it with others.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Bullet>Generate your unique link in seconds</Bullet>
                  <Bullet>Share via URL or QR code from your dashboard</Bullet>
                  <Bullet>Earn rewards when your referrals join</Bullet>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link
                      href="/services/referrals/referrer"
                      aria-label="Continue as Referrer"
                    >
                      Continue as Referrer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <p className="pt-1 text-xs text-muted-foreground">
                  Pro tip: Save your QR to share at events or in-store.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
