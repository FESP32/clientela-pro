// app/(dashboard)/dashboard/products/page.tsx
import Link from "next/link";
import { format } from "date-fns";
import { listProducts, deleteProduct } from "./actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <Card className=" max-w-6xl">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[36%]">Name</TableHead>
                  <TableHead className="w-[34%]">Metadata</TableHead>
                  <TableHead className="w-[18%]">Created</TableHead>
                  <TableHead className="w-[12%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.metadata && Object.keys(p.metadata).length > 0
                        ? JSON.stringify(p.metadata)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.created_at
                        ? format(new Date(p.created_at), "PPP")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
