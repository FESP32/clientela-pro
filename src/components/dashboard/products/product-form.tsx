"use client";

import Link from "next/link";
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

type ProductFormProps = {
  onSubmit: (formData: FormData) => Promise<void>; // server action
  title?: string;
  submitLabel?: string;
  cancelHref?: string;
  defaultValues?: {
    name?: string;
    metadata?: string; // stringified JSON if editing
  };
};

export default function ProductForm({
  onSubmit,
  title = "Create Product",
  submitLabel = "Create",
  cancelHref = "/dashboard/products",
  defaultValues,
}: ProductFormProps) {
  return (
    <form action={onSubmit} className="max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Apple Pie"
              required
              defaultValue={defaultValues?.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON, optional)</Label>
            <Textarea
              id="metadata"
              name="metadata"
              rows={6}
              placeholder={`{ "category": "Dessert", "sku": "APPLE-PIE-001" }`}
              defaultValue={defaultValues?.metadata}
            />
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button type="submit">{submitLabel}</Button>
          <Button asChild variant="outline">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
