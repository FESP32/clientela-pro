// app/stamps/[cardId]/page.tsx
import { notFound } from "next/navigation";
import { getCustomerStampCard } from "@/actions";
import StampCard from "@/components/services/stamps/stamp-card";
import CustomerListSection from "@/components/common/customer-list-section";
import { Badge } from "@/components/ui/badge";

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
  if (card.status !== "active") notFound();

  return (
      <StampCard card={card} membership={membership} />
  );
}
