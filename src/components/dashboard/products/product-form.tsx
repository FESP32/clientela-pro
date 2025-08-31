"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SubmitButton from "../common/submit-button";
import { Package, Info, Code2 } from "lucide-react";

type ProductFormProps = {
  onSubmit: (formData: FormData) => Promise<void>; // server action
  title?: string;
  submitLabel?: string; // kept for compatibility if your SubmitButton supports it
  cancelHref?: string;
  defaultValues?: {
    name?: string;
    metadata?: string; // stringified JSON if editing
  };
};

export default function ProductForm({
  onSubmit,
  defaultValues,
  title = "Create Product",
  // submitLabel, // if your SubmitButton supports it, pass it down
  cancelHref = "/dashboard/products",
}: ProductFormProps) {
  return (
    <form action={onSubmit} className="mx-auto max-w-6xl">
      {/* Header */}
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              {title}
            </h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Info className="h-4 w-4" aria-hidden="true" />
              Give your product a clear, memorable name.
            </span>
            <span className="inline-flex items-center gap-1">
              <Code2 className="h-4 w-4" aria-hidden="true" />
              (Optional) Add JSON metadata for SKU, category, etc.
            </span>
          </p>
        </div>
      </header>

      {/* Body */}
      <section className="rounded-lg   space-y-4 ">
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
          <p className="text-xs text-muted-foreground">
            Tip: Keep keys predictable (e.g., <code>sku</code>,{" "}
            <code>category</code>).
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-4 flex gap-2">
        {/* If your SubmitButton supports a label prop or children, wire submitLabel here */}
        <SubmitButton />
        <Button asChild variant="outline">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
