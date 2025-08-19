// app/(dashboard)/loyalty/cards/new/page.tsx
import {
  getOwnerProducts,
  createStampCard,
} from "@/actions/stamps";
import StampCardForm from "@/components/dashboard/stamp-card-form";

export const dynamic = "force-dynamic";

export default async function NewStampCardPage() {
  const products = await getOwnerProducts();

  return (
    <div className="p-4">
      <StampCardForm products={products} onSubmit={createStampCard} />
    </div>
  );
}
