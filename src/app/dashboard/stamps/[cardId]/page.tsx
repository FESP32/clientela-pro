// app/dashboard/stamps/[cardId]/intents/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { listStampIntents, createStampIntent } from "@/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SubmitButton from "@/components/dashboard/common/submit-button";
import MerchantListSection from "@/components/dashboard/common/merchant-list-section";
import MerchantStampIntentsTable from "@/components/dashboard/stamps/merchant-stamp-intent-table";
import { CalendarClock, Hash, Info, StickyNote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CardIntentsPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const { card, intents } = await listStampIntents(cardId);

  if (!card) {
    notFound();
  }

  const pending = intents.filter((i) => i.status === "pending").length;

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Intents — {card.title}</span>
          <Badge variant="secondary">{intents.length} total</Badge>
          <Badge>{pending} pending</Badge>
        </div>
      }
      subtitle="Create, manage and track usage windows for this card."
    >
      {/* Create form */}
      <TooltipProvider>
        <form
          action={createStampIntent}
          className="mb-4 grid w-full grid-cols-1 gap-3 md:grid-cols-[auto_auto_minmax(180px,1fr)_minmax(220px,1fr)_auto] md:items-end"
        >
          <input type="hidden" name="card_id" value={cardId} />

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

          {/* Note */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="note">Note</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  Optional. Internal note to help you identify this batch.
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="relative">
              <StickyNote className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="note"
                type="text"
                name="note"
                placeholder="e.g. Promo weekend, VIP customers, etc."
                className="h-9 w-full pl-8"
                aria-describedby="note-tip"
              />
            </div>
            <p id="note-tip" className="text-xs text-muted-foreground">
              Visible to your team only.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <SubmitButton />
          </div>
        </form>
      </TooltipProvider>

      <Separator className="my-2" />

      <MerchantStampIntentsTable intents={intents} />
      {/* Optional back action */}
      <div className="mt-3">
        <Button asChild variant="outline">
          <Link href="/dashboard/stamps">Back to Cards</Link>
        </Button>
      </div>
    </MerchantListSection>
  );
}
