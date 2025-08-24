import { createProduct } from "@/actions/products";
import ProductForm from "@/components/dashboard/products/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  return (
    <div className="p-4">
      <ProductForm onSubmit={createProduct} />
    </div>
  );
}
