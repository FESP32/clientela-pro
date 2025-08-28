// app/services/gifts/[intentId]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { claimGiftIntent } from "@/actions/gifts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fmt } from "@/lib/utils";
import { QR } from "@/components/ui/qr"; // <-- added

type GiftIntentView = {
  id: string;
  status: "pending" | "consumed" | "canceled" | "claimed";
  expires_at: string | null;
  consumed_at: string | null;
  created_at: string;
  gift: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    business: {
      id: string;
      name: string | null;
      image_url: string | null;
    } | null;
  } | null;
  customer: { user_id: string; name: string | null } | null;
};

export const dynamic = "force-dynamic";

export default async function GiftConsumePage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {

  const { intentId } = await params;
  const supabase = await createClient();

  // Auth (ok if null; we’ll show a sign-in CTA)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load intent + gift + business + (optional) customer
  const { data, error } = await supabase
    .from("gift_intent")
    .select(
      `
      id, status, created_at, expires_at, consumed_at,
      gift:gift (
        id, title, description, image_url,
        business:business ( id, name, image_url )
      ),
      customer:profile!gift_intent_customer_id_fkey ( user_id, name )
    `
    )
    .eq("id", intentId)
    .maybeSingle()
    .overrideTypes<GiftIntentView>();

  if (error) notFound();
  if (!data) notFound();

  const intent = data;
  const gift = intent.gift;
  const business = gift?.business ?? null;

  const now = new Date();
  const isExpired = !!intent.expires_at && new Date(intent.expires_at) <= now;

  const canClaim =
    intent.status === "pending" && !isExpired && !intent.customer?.user_id;

  // Merchant dashboard path for this intent (used in QR)
  const merchantIntentPath = `/dashboard/gifts/intent/${intent.id}`;

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">Claim Gift</CardTitle>
          {gift?.title ? (
            <p className="text-sm text-muted-foreground">
              You’re claiming: <span className="font-medium">{gift.title}</span>
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Gift / Business header */}
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

          <Separator />

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

          {/* Claim CTA / info */}
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

          {/* Claim form if eligible */}
          {canClaim ? (
            user ? (
              <form action={claimGiftIntent} className="space-y-2">
                <input type="hidden" name="intent_id" value={intent.id} />
                <Button type="submit" className="w-full sm:w-auto">
                  Claim this gift
                </Button>
                <p className="text-xs text-muted-foreground">
                  By claiming, this gift will be assigned to your account and
                  marked as <span className="font-medium">consumed</span>.
                </p>
              </form>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You need to sign in to claim this gift.
                </p>
                <Button asChild>
                  <Link
                    href={`/login?next=${encodeURIComponent(
                      `/services/gifts/${intent.id}`
                    )}`}
                  >
                    Sign in to continue
                  </Link>
                </Button>
              </div>
            )
          ) : null}

          {/* QR shown once consumed or claimed */}
          {(intent.status === "consumed" || intent.status === "claimed") && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Show this code to the merchant to complete verification.
                </p>
                <div className="flex items-center justify-center">
                  <div className="rounded-lg border p-3 bg-background">
                    <QR value={merchantIntentPath} size={220} />
                  </div>
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  Merchant link: {merchantIntentPath}
                </div>
              </div>
            </>
          )}

          {/* Helpful links */}
          <div className="flex flex-wrap gap-2 pt-2">
            {gift?.id ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/services/gifts/${gift.id}`}>View gift</Link>
              </Button>
            ) : null}
            {business?.id ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/businesses/${business.id}`}>
                  View business
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
