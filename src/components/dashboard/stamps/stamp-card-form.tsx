"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ProductRow } from "@/types/products";
import SubmitButton from "../common/submit-button";
import { Stamp, Gift, CalendarClock, CheckSquare } from "lucide-react";

export default function StampCardForm({
  products,
  onSubmit,
}: {
  products: ProductRow[];
  onSubmit: (fd: FormData) => void | Promise<void>;
}) {
  const [selectAll, setSelectAll] = useState(false);

  const toggleAll = (form: HTMLFormElement) => {
    const boxes = Array.from(
      form.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"][name="product_ids[]"]'
      )
    );
    boxes.forEach((b) => (b.checked = !selectAll));
    setSelectAll(!selectAll);
  };

  return (
    <form action={onSubmit} >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Stamp className="h-5 w-5 text-primary" aria-hidden="true" />
              <h1 className="text-2xl font-semibold leading-none tracking-tight">
                Create Stamp Card
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Gift className="h-4 w-4" aria-hidden="true" />
                Define the reward your customers earn.
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Set active window & status.
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckSquare className="h-4 w-4" aria-hidden="true" />
                Choose which products apply.
              </span>
            </p>
          </div>
        </header>

        {/* Body */}
        <section className="rounded-lg border bg-card p-6 space-y-6">
          {/* Basics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Coffee Card"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stamps_required">Stamps required</Label>
              <Input
                id="stamps_required"
                name="stamps_required"
                type="number"
                min={1}
                step={1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal_text">Reward / Goal</Label>
            <Textarea
              id="goal_text"
              name="goal_text"
              placeholder="Free coffee after collecting all stamps"
              required
            />
          </div>

          {/* Status & window */}
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="is_active">Active</Label>
              <div className="flex items-center gap-3">
                {/* Note: shadcn <Switch> doesn't submit a value by default; keeping your original usage */}
                <Switch id="is_active" name="is_active" />
                <span className="text-sm text-muted-foreground">
                  Card is active
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_from">Valid from</Label>
              <Input id="valid_from" name="valid_from" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_to">Valid to</Label>
              <Input id="valid_to" name="valid_to" type="datetime-local" />
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Applies to products</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) =>
                  toggleAll(
                    (e.currentTarget.closest("form") as HTMLFormElement)!
                  )
                }
              >
                {selectAll ? "Unselect all" : "Select all"}
              </Button>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don’t have products yet. Add some first to target this card.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted"
                  >
                    <Checkbox name="product_ids[]" value={String(p.id)} />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-2">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
