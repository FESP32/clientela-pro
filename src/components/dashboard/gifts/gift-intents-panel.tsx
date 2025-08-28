// components/dashboard/gifts/gift-intents-panel.tsx
import Image from "next/image";
import Link from "next/link";
import { listGiftIntents, createGiftIntent } from "@/actions/gifts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GiftIntentsTable from "./gift-intents-table";

export default async function GiftIntentsPanel({ giftId }: { giftId: string }) {
  const { user, gift, intents, error } = await listGiftIntents(giftId);

  if (!user) {
    return (
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Gift Intents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You must be signed in to view this gift.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !gift) {
    return (
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Gift Intents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {error ?? "Gift not found."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
            {gift.image_url ? (
              <Image
                src={gift.image_url}
                alt={`${gift.title} image`}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {gift.title?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>
          <div>
            <CardTitle className="leading-tight">{gift.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {gift.description ?? "No description provided."}
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="shrink-0 self-start">
          Gift ID: {gift.id}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Create intents */}
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium">Create new gift intents</h3>
          <p className="text-xs text-muted-foreground">
            Generate one or more intents for this gift. You can optionally set
            an expiry or assign a customer upfront.
          </p>

          <form
            action={createGiftIntent}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <input type="hidden" name="gift_id" value={gift.id} />

            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                name="qty"
                type="number"
                min={1}
                defaultValue={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expires at (optional)</Label>
              <Input id="expires_at" name="expires_at" type="datetime-local" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer ID (optional)</Label>
              <Input
                id="customer_id"
                name="customer_id"
                placeholder="profile.user_id"
              />
            </div>

            <div className="sm:col-span-3">
              <Button type="submit">Create intents</Button>
            </div>
          </form>
        </div>

        <Separator />

        {/* List intents */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Intents</h3>
          {intents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No intents created yet.
            </p>
          ) : (
            <GiftIntentsTable intents={intents} />
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        Tip: You can share intent IDs externally and build a claim flow that
        marks them as <code>claimed</code> or <code>consumed</code>.
      </CardFooter>
    </Card>
  );
}
