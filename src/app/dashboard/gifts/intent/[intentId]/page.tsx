import { notFound } from "next/navigation";
import GiftIntentView from "@/components/dashboard/gifts/merchant-gift-intent";
import { getGiftIntentForDashboard } from "@/actions";

export const dynamic = "force-dynamic";

export default async function GiftIntentPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;

  const { userId, intent } = await getGiftIntentForDashboard(intentId);

  if (!intent) notFound();

  return <GiftIntentView intent={intent} userId={userId} />;
}
