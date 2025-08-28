// app/(dashboard)/dashboard/products/page.tsx
import Link from "next/link";
import { listProducts, deleteProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductsTable from "@/components/dashboard/products/products-table";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { user, products, error } = await listProducts();

  if (!user) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You must be signed in to view your products.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-6xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Button asChild>
            <Link href="/dashboard/products/new">New Product</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load products: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Card className="max-w-6xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Your Products</CardTitle>
          <Button asChild>
            <Link href="/dashboard/products/new">New Product</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div>
                <p className="font-medium">No products yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first product to get started.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/products/new">Create Product</Link>
              </Button>
            </div>
          ) : (
            <ProductsTable products={products} deleteProduct={deleteProduct} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
