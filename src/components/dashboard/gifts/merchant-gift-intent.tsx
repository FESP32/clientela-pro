import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { markGiftIntentClaimed } from "@/actions"; // existing action
import { GiftIntentDashboardView } from "@/types";


function StatusPill({ status }: { status: GiftIntentDashboardView["status"] }) {
  const variant =
    status === "claimed"
      ? "default"
      : status === "consumed"
      ? "secondary"
      : status === "pending"
      ? "outline"
      : "destructive";

  return (
    <Badge variant={variant} className="text-xs">
      {status.toUpperCase()}
    </Badge>
  );
}

export default function GiftIntentView({
  intent,
  userId,
}: {
  intent: GiftIntentDashboardView;
  userId: string | null;
}) {
  const gift = intent.gift;
  const business = intent.business;

  const isBusinessOwner = !!userId && business?.owner_id === userId;

  return (
    <div className="p-4 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gift Intent</CardTitle>
          <StatusPill status={intent.status} />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Gift info */}
          <div className="flex gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{gift?.title ?? "Gift"}</h2>
              {gift?.description ? (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {gift.description}
                </p>
              ) : null}

              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Business: </span>
                  {business?.name ?? "—"}
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
                "Customer has claimed this gift. Mark it as “claimed” after redemption."}
              {intent.status === "claimed" &&
                "This gift has been fully redeemed and closed."}
              {intent.status === "canceled" && "This gift intent was canceled."}
            </div>

            {isBusinessOwner && intent.status === "consumed" ? (
              <form action={markGiftIntentClaimed}>
                <input type="hidden" name="intent_id" value={intent.id} />
                <Button type="submit">Mark as Claimed</Button>
              </form>
            ) : (
              <Button type="button" disabled>
                {intent.status === "consumed"
                  ? "Only owner can claim"
                  : "No actions"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
