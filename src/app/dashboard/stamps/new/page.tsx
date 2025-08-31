// app/(dashboard)/loyalty/cards/new/page.tsx
import { listProducts } from "@/actions";
import {
  createStampCard,
} from "@/actions";
import StampCardForm from "@/components/dashboard/stamps/stamp-card-form";

export const dynamic = "force-dynamic";

export default async function NewStampCardPage() {
  const { data } = await listProducts();

  return (
    <div className="p-4">
      <StampCardForm products={data} onSubmit={createStampCard} />
    </div>
  );
}
