// components/loyalty/loyalty-card-form.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

type Product = { id: string; name: string };

export default function StampCardForm({
  products,
  onSubmit,
}: {
  products: Product[];
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
    <Card className="max-w-3xl">
      <form action={onSubmit} className="contents">
        <CardHeader>
          <CardTitle>Create Stamp Card</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="is_active">Active</Label>
              <div className="flex items-center gap-3">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {products.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted cursor-pointer"
                  >
                    <Checkbox name="product_ids[]" value={p.id} />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button type="submit">Create Card</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
