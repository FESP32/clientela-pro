"use client";

import { useMemo, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import SubmitButton from "../../common/submit-button";
import { ProductRow } from "@/types/products";
import {
  Stamp,
  Gift,
  CalendarClock,
  CheckSquare,
  Hash,
  Info,
  CalendarRange,
  Sun,
  Clock3,
  CalendarPlus,
  Eraser,
} from "lucide-react";
import MonoIcon from "../../common/mono-icon";
import { format, addDays, endOfDay } from "date-fns";

export default function StampCardForm({
  products,
  onSubmit,
}: {
  products: ProductRow[];
  onSubmit: (fd: FormData) => void | Promise<void>;
}) {
  const allIds = useMemo(() => products.map((p) => String(p.id)), [products]);
  const [selected, setSelected] = useState<string[]>([]);
  const allChecked = allIds.length > 0 && selected.length === allIds.length;
  const someChecked = selected.length > 0 && !allChecked;
  const masterState: boolean | "indeterminate" = allChecked
    ? true
    : someChecked
    ? "indeterminate"
    : false;

  const toggleAll = () => setSelected(allChecked ? [] : allIds);
  const toggleOne = (id: string, next: boolean) =>
    setSelected((prev) =>
      next ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
    );

  /* Quick date presets */
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const fmtLocal = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm");
  const applyRange = (start: Date | null, end: Date | null) => {
    if (fromRef.current) {
      fromRef.current.value = start ? fmtLocal(start) : "";
      fromRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (toRef.current) {
      toRef.current.value = end ? fmtLocal(end) : "";
      toRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };
  const now = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d;
  };
  const setToday = () => applyRange(now(), endOfDay(now()));
  const setPlus1d = () => applyRange(now(), addDays(now(), 1));
  const setPlus7d = () => applyRange(now(), addDays(now(), 7));
  const setPlus30d = () => applyRange(now(), addDays(now(), 30));
  const clearRange = () => applyRange(null, null);

  return (
    <form action={onSubmit}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MonoIcon>
                <Stamp className="size-4" aria-hidden="true" />
              </MonoIcon>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Create Stamp Card
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Gift className="h-4 w-4" /> Define the reward your customers
                earn.
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-4 w-4" /> Set active window &
                status.
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckSquare className="h-4 w-4" /> Choose which products apply.
              </span>
            </p>
          </div>
        </header>

        {/* Body */}
        <section className="space-y-8">
          {/* Basics */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <div className="relative">
                  <Gift className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Coffee Card"
                    required
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  A short, recognisable name customers will see.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stamps_required">Stamps required</Label>
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="stamps_required"
                    name="stamps_required"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    required
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  How many stamps to redeem (minimum 1).
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="goal_text">Reward / Goal</Label>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Textarea
                id="goal_text"
                name="goal_text"
                placeholder="e.g. Free coffee after collecting all stamps"
                required
                className="min-h-[90px]"
              />
              <p className="text-xs text-muted-foreground">
                Tell customers exactly what they get when finished.
              </p>
            </div>
          </div>

          {/* Status & window (rearranged) */}
          <div className="space-y-4">
            {/* 1) Active at the top */}
            <div className="space-y-1.5">
              <Label htmlFor="is_active">Active</Label>
              <div className="flex items-center gap-3">
                <Switch id="is_active" name="is_active" />
                <span className="text-sm text-muted-foreground">
                  Make this card available to customers
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                You can toggle this later without losing data.
              </p>
            </div>

            {/* 2) Quick range ABOVE the pickers */}
            <div>
              <div
                className="flex flex-wrap items-center gap-2"
                aria-label="Quick time range"
              >
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarRange className="h-4 w-4" aria-hidden="true" />
                  Quick range:
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setToday}
                >
                  <Sun className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Today
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setPlus1d}
                >
                  <Clock3 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Now → +1 day
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setPlus7d}
                >
                  <CalendarPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Now → +7 days
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setPlus30d}
                >
                  <CalendarPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Now → +30 days
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearRange}
                  className="text-muted-foreground"
                >
                  <Eraser className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Clear
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Presets set both start and end. You can still fine-tune the
                times below.
              </p>
            </div>

            {/* 3) Date pickers */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="valid_from">Valid from</Label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="valid_from"
                    name="valid_from"
                    type="datetime-local"
                    className="pl-8"
                    ref={fromRef}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional. Leave empty to start immediately.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="valid_to">Valid to</Label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="valid_to"
                    name="valid_to"
                    type="datetime-local"
                    className="pl-8"
                    ref={toRef}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional. Leave empty for no end date.
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckSquare className="h-4 w-4 text-primary" />
                Applies to products
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={masterState}
                  onCheckedChange={toggleAll}
                  aria-label={
                    allChecked ? "Unselect all products" : "Select all products"
                  }
                />
                {allChecked
                  ? "Unselect all"
                  : someChecked
                  ? "Select all"
                  : "Select all"}
              </label>
            </div>

            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don’t have any products yet. Add products first to target
                this card.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Selected{" "}
                  <span className="tabular-nums">{selected.length}</span> of{" "}
                  <span className="tabular-nums">{allIds.length}</span>
                </p>

                {selected.map((id) => (
                  <input
                    key={id}
                    type="hidden"
                    name="product_ids[]"
                    value={id}
                  />
                ))}

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {products.map((p) => {
                    const id = String(p.id);
                    const checked = selected.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => toggleOne(id, v === true)}
                          aria-label={`Toggle ${p.name}`}
                        />
                        <span className="text-sm truncate">{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
