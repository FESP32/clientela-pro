// app/dashboard/products/page.tsx
import { listProducts, deleteProduct } from "@/actions";
import MerchantListSection from "@/components/common/merchant-list-section";
import MonoIcon from "@/components/common/mono-icon";
import ProductsExplorer from "@/components/dashboard/products/products-explorer";
import { Badge } from "@/components/ui/badge";
import { Package2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { data = [] } = await listProducts();
  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <MonoIcon>
              <Package2
                className="size-4"
                aria-hidden="true"
              />
            </MonoIcon>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Products
            </h1>
          </div>
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Curate a clean, consistent catalog with smart metadata.
          </span>
        </div>
      }
      headerClassName="mb-4"
      contentClassName="space-y-4"
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      <ProductsExplorer products={data} deleteProduct={deleteProduct} />
    </MerchantListSection>
  );
}
