import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { markIntentClaimed } from "@/actions";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClaimIntentPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: intent, error } = await supabase
    .from("referral_intent")
    .select(
      `
      id, status, created_at, expires_at,
      referred_id, referrer_id, program_id,
      referral_program (id, title)
    `
    )
    .eq("id", intentId)
    .maybeSingle();

  if (error) return <p className="p-4 text-red-600">Error: {error.message}</p>;
  if (!intent) return <p className="p-4">Intent not found.</p>;

  const isExpired =
    intent.expires_at && new Date(intent.expires_at) < new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const programTitle = Array.isArray((intent as any).referral_program)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (intent as any).referral_program[0]?.title
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : (intent as any).referral_program?.title;

  return (
    <div className="p-4 flex justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Claim Referral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <span className="font-medium">Program:</span> {programTitle ?? "—"}
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
          {intent.expires_at && (
            <p>
              <span className="font-medium">Expires:</span>{" "}
              {format(new Date(intent.expires_at), "PPp")}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {!user ? (
            <Button asChild className="w-full">
              <Link
                href={`/login?next=/dashboard/referral/intent/${intentId}/claim`}
              >
                Sign in to continue
              </Link>
            </Button>
          ) : isExpired ? (
            <p className="text-sm text-muted-foreground w-full text-center">
              This referral is expired.
            </p>
          ) : intent.status === "claimed" ? (
            <p className="text-sm text-green-700 w-full text-center">
              Already claimed.
            </p>
          ) : intent.status === "pending" || intent.status === "consumed" ? (
            <form action={markIntentClaimed} className="w-full">
              <input type="hidden" name="intent_id" value={intentId} />
              <Button type="submit" className="w-full">
                {intent.status === "consumed"
                  ? "Mark as Claimed"
                  : "Claim this referral"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground w-full text-center">
              This referral cannot be claimed.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
