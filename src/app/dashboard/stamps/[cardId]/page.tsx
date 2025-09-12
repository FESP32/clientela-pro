import Link from "next/link";
import { notFound } from "next/navigation";
import { listStampIntents, createStampIntent } from "@/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MerchantListSection from "@/components/common/merchant-list-section";
import MerchantStampIntentsTable from "@/components/dashboard/stamps/merchant-stamp-intent-table";
import StampIntentsCreateForm from "@/components/dashboard/stamps/stamp-intents-create-form";

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
      {/* Create form (now a client component) */}
      <StampIntentsCreateForm
        card={card}
        intents={intents}
        onSubmit={createStampIntent}
      />

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
