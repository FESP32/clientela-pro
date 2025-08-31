// components/dashboard/gifts/gift-intents-panel.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { listGiftIntents, createGiftIntent } from "@/actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import SubmitButton from "@/components/dashboard/common/submit-button";
import MerchantListSection from "@/components/dashboard/common/merchant-list-section";
import MerchantGiftIntentsTable from "@/components/dashboard/gifts/merchant-gift-intents-table"; // responsive list+table version

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarClock, Hash, Info, User } from "lucide-react";

export default async function GiftIntentsPanel({ giftId }: { giftId: string }) {
  const { gift, intents } = await listGiftIntents(giftId);

  if (!gift) {
    notFound();
  }

  const pending = intents.filter((i) => i.status === "pending").length;

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Intents — {gift.title}</span>
          <Badge variant="secondary">{intents.length} total</Badge>
          <Badge>{pending} pending</Badge>
        </div>
      }
      subtitle="Create, manage, and track usage windows for this gift."
      contentClassName="space-y-4"
    >
      {/* Create form (icon-labeled, with tips) */}
      <TooltipProvider>
        <form
          action={createGiftIntent}
          className="mb-2 grid w-full grid-cols-1 gap-3 md:grid-cols-[auto_minmax(220px,1fr)_minmax(220px,1fr)_auto] md:items-end"
        >
          <input type="hidden" name="gift_id" value={gift.id} />

          {/* Qty */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="qty">Qty</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  How many intents (codes) to create.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="qty"
                type="number"
                name="qty"
                min={1}
                defaultValue={1}
                inputMode="numeric"
                className="h-9 w-24 pl-8"
                aria-describedby="qty-tip"
              />
            </div>
            <p id="qty-tip" className="text-xs text-muted-foreground">
              Minimum 1. You can create more later.
            </p>
          </div>

          {/* Expires at */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="expires_at">Expires at</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Optional. Leave blank for no expiration.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="expires_at"
                type="datetime-local"
                name="expires_at"
                className="h-9 pl-8"
                aria-describedby="exp-tip"
              />
            </div>
            <p id="exp-tip" className="text-xs text-muted-foreground">
              Uses your local time. You can edit later.
            </p>
          </div>

          {/* Customer ID */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="customer_id">Customer ID</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Optional. Pre-assign to a customer (profile.user_id).
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <User className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="customer_id"
                name="customer_id"
                placeholder="profile.user_id"
                className="h-9 pl-8"
                aria-describedby="cust-tip"
              />
            </div>
            <p id="cust-tip" className="text-xs text-muted-foreground">
              Leave empty to allow anyone to claim.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <SubmitButton />
          </div>
        </form>
      </TooltipProvider>

      <Separator className="my-2" />

      {/* List intents (responsive list/table) */}
      <MerchantGiftIntentsTable intents={intents} />

      {/* Optional back action */}
      <div className="mt-3">
        <Button asChild variant="outline">
          <Link href="/dashboard/gifts">Back to Gifts</Link>
        </Button>
      </div>
    </MerchantListSection>
  );
}
