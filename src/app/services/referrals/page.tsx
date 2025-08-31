"use client";

import Link from "next/link";
import {
  Gift,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

export default function ReferralsHomePage() {
  return (
    <div className="min-h-screen p-6 pb-24 flex items-start justify-center">
      <div className="w-full max-w-2xl space-y-5">
        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Grow with referrals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Referrals
          </h1>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground">
            Join with an invite you received, or create & share your own link to
            invite others and earn rewards.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Referred */}
          <Card className="group h-full transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="h-4 w-4 text-indigo-600" />I have an invite
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Redeem a referral you received from a friend or business.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Bullet>Paste or scan a referral link/QR to continue</Bullet>
                <Bullet>Preview rewards before you accept</Bullet>
                <Bullet>Track your referral status anytime</Bullet>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild className="flex-1">
                  <Link href="/services/referrals/referred">
                    Continue as Referred
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="pt-1 text-xs text-muted-foreground">
                Tip: If you already have a URL, you can open it directly.
              </div>
            </CardContent>
          </Card>

          {/* Referrer */}
          <Card className="group h-full transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                I’m a referrer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create a personal referral link and share it with others.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              <Separator />
              <div className="space-y-2">
                <Bullet>Generate your unique link in seconds</Bullet>
                <Bullet>Share via URL or QR code from your dashboard</Bullet>
                <Bullet>Earn rewards when your referrals join</Bullet>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild className="flex-1">
                  <Link href="/services/referrals/referrer">
                    Continue as Referrer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="pt-1 text-xs text-muted-foreground">
                Pro tip: Save your QR to share at events or in-store.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
