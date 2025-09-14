import Link from "next/link";
import { notFound } from "next/navigation";
import { listGiftIntents, createGiftIntent } from "@/actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MerchantListSection from "@/components/common/merchant-list-section";
import MerchantGiftIntentsTable from "@/components/dashboard/gifts/merchant-gift-intents-table";
import GiftIntentsCreateForm from "@/components/dashboard/gifts/gift-intents-create-form";

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
    >
      {/* Create form (moved to client component) */}
      <GiftIntentsCreateForm
        gift={gift}
        intents={intents}
        onSubmit={createGiftIntent}
      />

      <Separator className="my-2" />

      {/* List intents (responsive list/table) */}
      <MerchantGiftIntentsTable intents={intents} />

      {/* Optional back action */}
      <div className="my-8">
        <Button asChild variant="outline">
          <Link href="/dashboard/gifts">Back to Gifts</Link>
        </Button>
      </div>
    </MerchantListSection>
  );
}
