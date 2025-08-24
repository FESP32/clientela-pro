"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReferralsHomePage() {

  return (
    <div className="min-h-svh p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold tracking-tight text-center">
          Referrals
        </h1>

        {/* Referred */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">I have an invite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Open the referred flow to claim your invite.
            </p>
            <Button asChild className="w-full">
              <Link href="/services/referrals/referred">Go to Referred</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Referrer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">I’m a referrer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link
                  href={`/services/referrals/referrer`}
                >
                  Go to Referrer
                </Link>
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
