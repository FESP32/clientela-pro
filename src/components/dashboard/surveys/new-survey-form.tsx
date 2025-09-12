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
} from "lucide-react";
import MonoIcon from "../../common/mono-icon";
import { useRef, useTransition } from "react";
import { format, addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewSurveyFormProps {
  products: ProductRow[];
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
}

function fmtLocal(dt: Date) {
  return format(dt, "yyyy-MM-dd'T'HH:mm");
}

export default function NewSurveyForm({ products, onSubmit }: NewSurveyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const applyRange = (start: Date | null, end: Date | null) => {
    if (startRef.current) {
      startRef.current.value = start ? fmtLocal(start) : "";
      // Dispatch input event to notify any listeners (helpful when mixing with form libs)
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
              <p id="range-help" className="mt-2 text-xs text-muted-foreground">
                Presets set both start and end. You can still fine-tune the
                times above.
              </p>
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
              identifying the respondent.
            </p>
          </div>

          <Separator />

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
