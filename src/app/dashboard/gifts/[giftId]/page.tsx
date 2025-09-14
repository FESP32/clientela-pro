// app/dashboard/gifts/[giftId]/page.tsx (example)
import GiftIntentsPanel from "@/components/dashboard/gifts/gift-intents-panel";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ giftId: string }> }) {
  const { giftId } = await params;
  return (
      <GiftIntentsPanel giftId={giftId} />
  );
}
