// app/(dashboard)/loyalty/cards/new/page.tsx
import { listProducts } from "@/actions";
import {
  createStampCard,
} from "@/actions/stamps";
import StampCardForm from "@/components/dashboard/stamps/stamp-card-form";

export const dynamic = "force-dynamic";

export default async function NewStampCardPage() {
  const { products } = await listProducts();

  return (
    <div className="p-4">
      <StampCardForm products={products} onSubmit={createStampCard} />
    </div>
  );
}
