"use client";

import Link from "next/link";
import TraitsPerScore from "@/components/dashboard/surveys/traits-per-score";
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
import SubmitButton from "@/components/dashboard/common/submit-button";
import { ProductRow } from "@/types/products";
import {
  ClipboardList,
  MessageSquare,
  CalendarClock,
  Shield,
  Sparkles,
} from "lucide-react";

interface NewSurveyFormProps {
  products: ProductRow[];
  action: (formData: FormData) => Promise<void>;
}

export default function NewSurveyForm({
  products,
  action,
}: NewSurveyFormProps) {
  return (
    <form action={action} className="p-4">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              <h1 className="text-2xl font-semibold leading-none tracking-tight">
                Create Survey
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Collect customer feedback
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Set active window & visibility
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Customize traits by score
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/surveys">Cancel</Link>
            </Button>
          </div>
        </header>

        {/* Details */}
        <section className="rounded-lg border bg-card p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product</Label>
              <Select name="product_id" required>
                <SelectTrigger id="product_id" aria-describedby="product_help">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="no-products" disabled>
                      No products found
                    </SelectItem>
                  ) : (
                    products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p id="product_help" className="text-xs text-muted-foreground">
                Choose which product this survey targets.
              </p>
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

          {/* Schedule & settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starts at</Label>
              <Input id="starts_at" name="starts_at" type="datetime-local" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">Ends at</Label>
              <Input id="ends_at" name="ends_at" type="datetime-local" />
            </div>

            {/* Active */}
            <div className="space-x-2 flex items-center md:col-span-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            {/* Anonymous */}
            <div className="space-x-2 flex items-center md:col-span-2">
              <input
                id="is_anonymous"
                name="is_anonymous"
                type="checkbox"
                defaultChecked
              />
              <Label
                htmlFor="is_anonymous"
                className="inline-flex items-center gap-1"
              >
                <Shield
                  className="h-3.5 w-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                Anonymous survey
              </Label>
            </div>

            <p className="text-sm text-muted-foreground md:col-span-2">
              When enabled, this survey is intended to collect responses without
              identifying the respondent. Ensure your server action/DB layer
              avoids storing user identifiers for responses to this survey.
            </p>
          </div>

          <Separator />

          {/* Trait editor */}
          <TraitsPerScore />
        </section>

        {/* Footer */}
        <div className="mt-4 flex gap-2">
          <SubmitButton />
          <Button asChild variant="outline">
            <Link href="/dashboard/surveys">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
