import { createProduct } from "@/actions";
import ProductForm from "@/components/dashboard/products/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  return (
    <div className="px-5 sm:px-6 lg:px-16 my-8">
      <ProductForm onSubmit={createProduct} />
    </div>
  );
}
