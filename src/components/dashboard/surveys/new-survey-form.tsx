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
import SubmitButton from "@/components/common/submit-button";
import { ProductRow } from "@/types/products";
import {
  ClipboardList,
  MessageSquare,
  CalendarClock,
  Shield,
  Sparkles,
  CalendarRange,
  Clock3,
  CalendarPlus,
  Eraser,
  Hash,
} from "lucide-react";
import MonoIcon from "../../common/mono-icon";
import { useRef, useTransition, useState } from "react";
import { format, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface NewSurveyFormProps {
  products: ProductRow[];
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
}

function fmtLocal(dt: Date) {
  return format(dt, "yyyy-MM-dd'T'HH:mm");
}

export default function NewSurveyForm({
  products,
  onSubmit,
}: NewSurveyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  // --- Anonymous toggle state + hidden checkbox sync (for server submission) ---
  const [isAnonymous, setIsAnonymous] = useState(true);
  const anonCheckboxRef = useRef<HTMLInputElement>(null);

  const applyRange = (start: Date | null, end: Date | null) => {
    if (startRef.current) {
      startRef.current.value = start ? fmtLocal(start) : "";
      startRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (endRef.current) {
      endRef.current.value = end ? fmtLocal(end) : "";
      endRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  const now = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d;
  };

  const setPlus1d = () => applyRange(now(), addDays(now(), 1));
  const setPlus7d = () => applyRange(now(), addDays(now(), 7));
  const setPlus30d = () => applyRange(now(), addDays(now(), 30));
  const clearRange = () => applyRange(null, null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/surveys");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MonoIcon>
                <ClipboardList className="size-4" aria-hidden="true" />
              </MonoIcon>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
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
        </header>

        {/* Privacy / Visibility — moved to the top and made a toggle */}
        <section
          aria-labelledby="privacy-heading"
          className="mb-4 rounded-lg border bg-card/50 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 id="privacy-heading" className="text-sm font-semibold">
                Privacy & Identity
              </h3>
              <p id="anon_help" className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  Anonymous responses
                </span>
              </p>
            </div>

            {/* Switch controls a hidden checkbox so the server still gets `is_anonymous` */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground select-none">
                {isAnonymous ? "On" : "Off"}
              </span>
              <Switch
                id="is_anonymous_toggle"
                checked={isAnonymous}
                onCheckedChange={(v) => {
                  setIsAnonymous(v);
                  if (anonCheckboxRef.current)
                    anonCheckboxRef.current.checked = v;
                }}
                aria-describedby="anon_help"
              />
              {/* Hidden checkbox that actually submits with the form */}
              <input
                ref={anonCheckboxRef}
                type="checkbox"
                name="is_anonymous"
                defaultChecked
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="rounded-lg space-y-6">
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

          <div className="space-y-1.5">
            <Label htmlFor="max_responses">Max Responses</Label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="max_responses"
                name="max_responses"
                type="number"
                inputMode="numeric"
                min={2}
                max={50}
                step={1}
                required
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              How many responses you want to collect (min 2, max 50).
            </p>
          </div>

          <Separator />

          {/* Schedule & settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Starts at</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                required
                defaultValue={fmtLocal(new Date())}
                ref={startRef}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">Ends at</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                required
                defaultValue={fmtLocal(addDays(now(), 1))}
                ref={endRef}
              />
            </div>

            {/* Quick range presets */}
            <div className="md:col-span-2">
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
                  className="cursor-pointer"
                  onClick={setPlus1d}
                >
                  <Clock3 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Now → +1 day
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={setPlus7d}
                >
                  <CalendarPlus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Now → +7 days
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
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
                  className="text-muted-foreground cursor-pointer"
                >
                  <Eraser className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Clear
                </Button>
              </div>
              <p id="range-help" className="mt-2 text-xs text-muted-foreground">
                Presets set both start and end. You can still fine-tune the
                times above.
              </p>
            </div>
          </div>

          <Separator />

          <TraitsPerScore />
        </section>

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
  