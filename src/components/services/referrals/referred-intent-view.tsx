// components/services/referrals/referred-intent-view.tsx
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { joinReferralIntent } from "@/actions";
import { format } from "date-fns";
import Link from "next/link";
import { QR } from "@/components/ui/qr";

export default async function ReferredIntentView({
  intentId,
}: {
  intentId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextPath = `/services/referrals/referred/${intentId}`;
  if (!user) {
    return (
      <div className="flex justify-center">
        <section
          className="relative w-full max-w-md rounded-2xl border border-border/60 bg-background/70 px-5 py-6 shadow-sm supports-[backdrop-filter]:bg-background/50 supports-[backdrop-filter]:backdrop-blur"
          aria-label="Sign in required"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary/20 via-primary/70 to-primary/20" />
          <header className="mb-3">
            <h2 className="text-lg font-semibold tracking-tight">Sign in required</h2>
          </header>
          <p className="text-sm text-muted-foreground">
            Please sign in to view and claim this referral invite.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Sign in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/services/referrals">Back</Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const { data: intent, error } = await supabase
    .from("referral_intent")
    .select(
      `
      id, status, created_at, expires_at, referrer_id, referred_id,
      referral_program (id, title)
    `
    )
    .eq("id", intentId)
    .maybeSingle();

  if (error) {
    return <p className="p-4 text-red-600">Error: {error.message}</p>;
  }
  if (!intent) {
    return <p className="p-4">Intent not found.</p>;
  }

  const isExpired =
    !!intent.expires_at && new Date(intent.expires_at) < new Date();
  const claimPath = `/dashboard/referrals/intent/${intentId}/claim`;
  const isClaimed = intent.status === "consumed" && !!intent.referred_id;

  return (
    <div className="flex justify-center">
      <section
        className="relative w-full max-w-md rounded-2xl border border-border/60 bg-background/70 px-5 py-6 shadow-sm supports-[backdrop-filter]:bg-background/50 supports-[backdrop-filter]:backdrop-blur"
        aria-label="Referral invite"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary/20 via-primary/70 to-primary/20" />

        <header className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Referral Invite
          </h2>
        </header>

        <div className="space-y-3">
          <p>
            <span className="font-medium">Program:</span>{" "}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(intent.referral_program as any)?.title ?? "—"}
          </p>
          <p>
            <span className="font-medium">Intent ID:</span>{" "}
            <span className="font-mono text-xs">{intent.id}</span>
          </p>
          <p>
            <span className="font-medium">Status:</span> {intent.status}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {format(new Date(intent.created_at), "PPp")}
          </p>
          <p>
            <span className="font-medium">Expires:</span>{" "}
            {intent.expires_at
              ? format(new Date(intent.expires_at), "PPp")
              : "—"}
          </p>

          {isClaimed ? (
            <div className="mt-4 grid place-items-center gap-3">
              <QR value={claimPath} />
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  This referral has already been Consumed.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          {!isClaimed && intent.status === "pending" && !isExpired ? (
            <form action={joinReferralIntent} className="w-full">
              <input type="hidden" name="intent_id" value={intentId} />

              {intent.referrer_id === user.id ? (
                <p className="mb-3 text-sm text-red-600">
                  You cannot claim your own referral invite.
                </p>
              ) : (
                <Button type="submit" className="w-full">
                  Claim this referral
                </Button>
              )}
            </form>
          ) : !isClaimed ? (
            <p className="text-sm text-muted-foreground">
              This referral cannot be claimed.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
