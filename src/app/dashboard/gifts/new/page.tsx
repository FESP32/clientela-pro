import { createGift } from "@/actions";
import GiftCreate from "@/components/dashboard/gifts/gift-create";

export const dynamic = "force-dynamic";

export default function NewGiftPage() {
  return (
    <div className="px-5 sm:px-6 lg:px-16 mt-8">
      <GiftCreate onSubmit={createGift} />
    </div>
  );
}
