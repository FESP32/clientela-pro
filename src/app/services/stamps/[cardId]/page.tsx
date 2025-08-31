// app/stamps/[cardId]/page.tsx
import { notFound } from "next/navigation";
import { getCustomerStampCard } from "@/actions";
import StampCard from "@/components/services/stamps/stamp-card";

export const dynamic = "force-dynamic";

export default async function CustomerStampCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const { user, card, membership, error } = await getCustomerStampCard(cardId);

  if (!user) notFound();
  if (error || !card) notFound();
  if (!membership) notFound();

  return (
    <div className="p-4">
      <StampCard card={card} membership={membership} />
    </div>
  );
}
