import { createGift } from "@/actions";
import GiftCreate from "@/components/dashboard/gifts/gift-create";

export const dynamic = "force-dynamic";

export default function NewGiftPage() {
  return (
    <div className="p-4">
      <GiftCreate action={createGift} />
    </div>
  );
}
