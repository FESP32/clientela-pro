// app/dashboard/gifts/intent/[intentId]/page.tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { markGiftIntentClaimed } from "@/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function GiftIntentPage({
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
    .from("gift_intent")
    .select(
      `
      id, status, expires_at, consumed_at, created_at, issuer_id, customer_id, gift_id,
      gift:gift(
        id, title, description, image_url
      ),
      issuer:profile!gift_intent_issuer_id_fkey(
        user_id, name
      ),
      customer:profile!gift_intent_customer_id_fkey(
        user_id, name
      )
    `
    )
    .eq("id", intentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!intent) notFound();

  const isIssuer = !!user && user.id === intent.issuer_id;

  const StatusPill = () => (
    <Badge
      variant={
        intent.status === "claimed"
          ? "default"
          : intent.status === "consumed"
          ? "secondary"
          : intent.status === "pending"
          ? "outline"
          : "destructive"
      }
      className="text-xs"
    >
      {intent.status.toUpperCase()}
    </Badge>
  );

  return (
    <div className="p-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gift Intent</CardTitle>
          <StatusPill />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Gift info */}
          <div className="flex gap-4">
            {intent.gift?.image_url ? (
              <div className="relative w-28 h-28 rounded-lg overflow-hidden border">
                <Image
                  src={intent.gift.image_url}
                  alt={intent.gift.title ?? "Gift image"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {intent.gift?.title ?? "Gift"}
              </h2>
              {intent.gift?.description ? (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {intent.gift.description}
                </p>
              ) : null}
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Issuer: </span>
                  {intent.issuer?.name ?? intent.issuer_id}
                </div>
                <div>
                  <span className="font-medium">Customer: </span>
                  {intent.customer?.name ?? intent.customer_id ?? "—"}
                </div>
                <div>
                  <span className="font-medium">Consumed at: </span>
                  {intent.consumed_at
                    ? new Date(intent.consumed_at).toLocaleString()
                    : "—"}
                </div>
                <div>
                  <span className="font-medium">Expires: </span>
                  {intent.expires_at
                    ? new Date(intent.expires_at).toLocaleString()
                    : "No expiry"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action area */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {intent.status === "pending" &&
                "Waiting for the customer to claim this gift."}
              {intent.status === "consumed" &&
                "Customer has claimed this gift. You can now mark it as 'claimed' after redemption."}
              {intent.status === "claimed" &&
                "This gift has been fully redeemed and closed."}
              {intent.status === "canceled" && "This gift intent was canceled."}
            </div>

            {isIssuer && intent.status === "consumed" ? (
              <form action={markGiftIntentClaimed}>
                <input type="hidden" name="intent_id" value={intent.id} />
                <Button type="submit">Mark as Claimed</Button>
              </form>
            ) : (
              <Button type="button" disabled>
                {intent.status === "consumed"
                  ? "Only issuer can claim"
                  : "No actions"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
