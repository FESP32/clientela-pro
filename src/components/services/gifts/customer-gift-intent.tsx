// components/services/gifts/gift-consume-view.tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QR } from "@/components/ui/qr";
import { fmt } from "@/lib/utils";
import { claimGiftIntent, getGiftIntent } from "@/actions";
import { notFound } from "next/navigation";

export default async function GiftConsumeView({
  intentId,
  userId,
}: {
  // intent: GiftIntentView;
  intentId: string;
  userId?: string | null;
}) {
  // 🔐 Guard: require sign-in to view/claim
  if (!userId) {
    const nextPath = `/services/gifts/intent/${intentId}`;
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-3">
          <h1 className="text-xl font-semibold tracking-tight">
            Sign in required
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please sign in to view and claim this gift invite.
          </p>
        </header>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
              Sign in to continue
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/services/gifts">Back</Link>
          </Button>
        </div>
      </section>
    );
  }

  const res = await getGiftIntent(intentId);
  if (!res.ok || !res.intent) notFound();

  const { intent } = res;
  const gift = intent.gift;
  const business = gift?.business ?? null;

  const now = new Date();
  const isExpired = !!intent.expires_at && new Date(intent.expires_at) <= now;
  const canClaim =
    intent.status === "pending" && !isExpired && !intent.customer?.user_id;

  // Merchant dashboard path for QR
  const merchantIntentPath = `/dashboard/gifts/intent/${intent.id}`;

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <header className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Claim Gift</h1>
        {gift?.title ? (
          <p className="text-sm text-muted-foreground">
            You’re claiming: <span className="font-medium">{gift.title}</span>
          </p>
        ) : null}
      </header>

      {/* Gift / Business */}
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
          {gift?.image_url ? (
            <Image
              src={gift.image_url}
              alt={`${gift.title ?? "Gift"} image`}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              {gift?.title?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-base font-medium">{gift?.title ?? "—"}</div>
          {gift?.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {gift.description}
            </p>
          ) : null}

          {business ? (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <div className="relative h-6 w-6 overflow-hidden rounded bg-muted">
                {business.image_url ? (
                  <Image
                    src={business.image_url}
                    alt={`${business.name ?? "Business"} logo`}
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    {business.name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                {business.name ?? "—"}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Status & timing */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge
          variant={
            intent.status === "pending"
              ? "secondary"
              : intent.status === "consumed"
              ? "default"
              : intent.status === "claimed"
              ? "default"
              : "outline"
          }
        >
          {intent.status}
        </Badge>
        <span className="text-muted-foreground">
          Created {fmt(intent.created_at)}
        </span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">
          Expires {fmt(intent.expires_at)}
        </span>
        {intent.consumed_at ? (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Consumed {fmt(intent.consumed_at)}
            </span>
          </>
        ) : null}
        {intent.customer?.name ? (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Claimed by {intent.customer.name}
            </span>
          </>
        ) : null}
      </div>

      {/* Status notes */}
      <div className="mt-3 space-y-1">
        {intent.status === "canceled" && (
          <p className="text-sm text-destructive">
            This gift invite was canceled.
          </p>
        )}

        {isExpired && intent.status === "pending" && (
          <p className="text-sm text-destructive">
            This gift invite has expired.
          </p>
        )}

        {intent.status === "consumed" && (
          <p className="text-sm text-muted-foreground">
            This gift has been consumed
            {intent.customer?.name ? (
              <>
                {" "}
                by <span className="font-medium">{intent.customer.name}</span>
              </>
            ) : null}
            .
          </p>
        )}

        {intent.status === "claimed" && (
          <p className="text-sm text-muted-foreground">
            This gift has been finalized by the merchant.
          </p>
        )}
      </div>

      {/* Claim form */}
      {canClaim ? (
        <form action={claimGiftIntent} className="mt-4 space-y-2">
          <input type="hidden" name="intent_id" value={intent.id} />
          <Button type="submit" className="w-full sm:w-auto">
            Claim this gift
          </Button>
          <p className="text-xs text-muted-foreground">
            By claiming, this gift will be assigned to your account and marked
            as <span className="font-medium">consumed</span>.
          </p>
        </form>
      ) : null}

      {/* QR shown once consumed or claimed */}
      {(intent.status === "consumed" || intent.status === "claimed") && (
        <>
          <Separator className="my-4" />
          <div aria-live="polite">
            <p className="mb-3 text-sm text-muted-foreground">
              Show this code to the merchant to complete verification.
            </p>
            <div className="flex items-center justify-center">
              <div className="bg-background p-3">
                <QR value={merchantIntentPath} size={220} />
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Merchant link: {merchantIntentPath}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
