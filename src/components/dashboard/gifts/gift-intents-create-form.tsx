"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SubmitButton from "@/components/common/submit-button";
import { CalendarClock, Hash, Info } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { toast } from "sonner";
import { useTransition } from "react";

type GiftRow = Tables<"gift">;
type GiftIntentRow = Tables<"gift_intent">;

export default function GiftIntentsCreateForm({
  gift,
  intents, // kept for potential validation or contextual UI
  onSubmit,
}: {
  gift: Pick<GiftRow, "id" | "title">;
  intents: Array<Pick<GiftIntentRow, "id" | "status">>;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <TooltipProvider>
      <form
        action={handleSubmit}
        className="mb-2 grid w-full grid-cols-1 gap-3 md:grid-cols-[auto_minmax(220px,1fr)_minmax(220px,1fr)_auto] md:items-end"
      >
        <input type="hidden" name="gift_id" value={gift.id} />

        {/* Qty */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="qty">Qty</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top">
                How many intents (codes) to create.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="qty"
              type="number"
              name="qty"
              min={1}
              defaultValue={1}
              inputMode="numeric"
              className="h-9 w-24 pl-8"
              aria-describedby="qty-tip"
            />
          </div>
          <p id="qty-tip" className="text-xs text-muted-foreground">
            Minimum 1. You can create more later.
          </p>
        </div>

        {/* Expires at */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="expires_at">Expires at</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top">
                Optional. Leave blank for no expiration.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <CalendarClock className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="expires_at"
              type="datetime-local"
              name="expires_at"
              className="h-9 pl-8"
              aria-describedby="exp-tip"
            />
          </div>
          <p id="exp-tip" className="text-xs text-muted-foreground">
            Uses your local time. You can edit later.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <SubmitButton />
        </div>
      </form>
    </TooltipProvider>
  );
}
