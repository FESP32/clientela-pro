// app/(dashboard)/surveys/new/page.tsx
import Link from "next/link";
import { getProductOptions, createSurvey } from "../actions";
import TraitsPerScore from "@/components/dashboard/traits-per-score";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const dynamic = "force-dynamic";

export default async function NewSurveyPage() {
  const products = await getProductOptions();

  return (
    <form action={createSurvey} className="p-4">
      <Card className="max-w-6xl">
        <CardHeader>
          <CardTitle>Create Survey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product</Label>
              <Select name="product_id" required>
                <SelectTrigger id="product_id">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="" disabled>
                      No products found
                    </SelectItem>
                  ) : (
                    products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Apple Pie Satisfaction"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Rate from 1–5 and add traits."
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starts at</Label>
              <Input id="starts_at" name="starts_at" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Ends at</Label>
              <Input id="ends_at" name="ends_at" type="datetime-local" />
            </div>
            <div className="space-x-2 flex items-center md:col-span-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <Separator />

          {/* New simplified trait editor */}
          <TraitsPerScore />
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button type="submit">Create Survey</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/surveys">Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
