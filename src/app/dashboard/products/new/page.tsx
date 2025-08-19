import Link from "next/link";
import { createProduct } from "@/actions/products";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  return (
    <div className="p-4">
      <form action={createProduct} className="max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Apple Pie" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON, optional)</Label>
              <Textarea
                id="metadata"
                name="metadata"
                rows={6}
                placeholder={`{ "category": "Dessert", "sku": "APPLE-PIE-001" }`}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/products">Cancel</Link>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
