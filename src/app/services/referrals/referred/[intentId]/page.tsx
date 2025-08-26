import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { joinReferralIntent } from "@/actions/referrals";
import { format } from "date-fns";
import Link from "next/link";
// Client QR component
import { QR } from "@/components/ui/qr";

export const dynamic = "force-dynamic";

export default async function ReferredIntentPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;
  const supabase = await createClient();

  // Fetch intent + program (joined)
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
    intent.expires_at && new Date(intent.expires_at) < new Date();

  // Where the QR should send users after it's already claimed
  const claimPath = `/dashboard/referrals/intent/${intentId}/claim`;
  // If you have NEXT_PUBLIC_APP_URL, you could also build an absolute URL server-side:
  // const base = process.env.NEXT_PUBLIC_APP_URL;
  // const claimUrl = base ? new URL(claimPath, base).toString() : claimPath;

  const isClaimed = intent.status === "consumed" && !!intent.referred_id;

  return (
    <div className="p-4 flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Referral Invite</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
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
                <Button asChild className="w-full">
                  <Link href={claimPath}>Open claim page</Link>
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>

        <CardFooter>
          {!isClaimed && intent.status === "pending" && !isExpired ? (
            <form action={joinReferralIntent} className="w-full">
              <input type="hidden" name="intent_id" value={intentId} />
              <Button type="submit" className="w-full">
                Claim this referral
              </Button>
            </form>
          ) : !isClaimed ? (
            <p className="text-sm text-muted-foreground">
              This referral cannot be claimed.
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
