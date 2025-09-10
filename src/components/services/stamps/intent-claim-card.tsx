// components/stamps/intent-claim-card.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { consumeStampIntent, getStampIntent } from "@/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { isExpired } from "@/lib/utils";
import {
  ArrowLeft,
  Stamp,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Info,
  LogIn,
} from "lucide-react";

export default async function IntentClaimCard({
  intentId,
}: {
  intentId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { intent } = await getStampIntent(intentId);
  if (!intent) notFound();

  const requiresLogin = !user;
  const expired = isExpired(intent.expires_at);
  const assignedToAnother =
    !!intent.customer_id && user?.id && intent.customer_id !== user.id;
  const claimable =
    intent.status === "pending" &&
    !expired &&
    !assignedToAnother &&
    !requiresLogin;

  const card = Array.isArray(intent.card) ? intent.card[0] : intent.card;

  return (
    <section className="mx-auto w-full max-w-xl px-5 py-6 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10">
          <Stamp className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Claim {card?.title ?? "Stamp"}{" "}
          <span className="text-muted-foreground">({intent.qty})</span>
        </h1>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Stamp className="h-3.5 w-3.5" />
            {intent.qty} punch{intent.qty > 1 ? "es" : ""}
          </Badge>

          {intent.status === "pending" ? (
            <Badge className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Pending
            </Badge>
          ) : intent.status === "consumed" ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Consumed
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Canceled
            </Badge>
          )}

          {expired && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Expired
            </Badge>
          )}
        </div>
      </div>

      <Separator className="my-5" />

      {/* Details */}
      <div className="space-y-3">
        {intent.note ? (
          <p className="text-sm">
            <span className="text-muted-foreground">Note: </span>
            {intent.note}
          </p>
        ) : null}

        {intent.expires_at && (
          <p className="text-xs text-muted-foreground flex items-center">
            <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
            Expires at: {new Date(intent.expires_at).toLocaleString()}
          </p>
        )}

        {assignedToAnother && (
          <p className="text-sm text-destructive flex items-center">
            <Info className="mr-1.5 h-4 w-4" />
            This intent is reserved for a different customer.
          </p>
        )}

        {requiresLogin && (
          <p className="text-sm text-muted-foreground flex items-center">
            <LogIn className="mr-1.5 h-4 w-4" />
            Please sign in to claim this intent.
          </p>
        )}

        {intent.status !== "pending" && (
          <p className="text-sm text-muted-foreground">
            This intent is already {intent.status}.
          </p>
        )}
      </div>

  

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button asChild variant="outline" className="group">
            <Link href="/services/stamps">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Stamps
            </Link>
          </Button>

          <Button asChild variant="outline">
            <Link
              href={card ? `/services/stamps/${card.id}` : "/services/stamps"}
            >
              View my card
            </Link>
          </Button>
        </div>

        {claimable ? (
          <form action={consumeStampIntent} className="contents">
            <input type="hidden" name="intent_id" value={intent.id} />
            <input
              type="hidden"
              name="redirect_to"
              value={`/stamps/intents/${intent.id}`}
            />
            <Button
              type="submit"
              className="transition-transform hover:-translate-y-0.5"
            >
              Claim
            </Button>
          </form>
        ) : requiresLogin ? (
          <Button asChild>
            <Link
              href={`/login?next=${encodeURIComponent(
                `/stamps/intents/${intent.id}`
              )}`}
            >
              Sign in
            </Link>
          </Button>
        ) : (
          <Button disabled>Claim</Button>
        )}
      </div>
    </section>
  );
}
