// components/referrals/referral-program-form.tsx
"use client";

import { useEffect, useRef, useState } from "react"; // ⬅️ add useRef
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Megaphone,
  Users,
  Gift,
  Plus,
  CalendarRange, // ⬅️ new
  Sun, // ⬅️ new
  Clock3, // ⬅️ new
  CalendarPlus, // ⬅️ new
  Eraser, // ⬅️ new
} from "lucide-react";
import SubmitButton from "@/components/common/submit-button";
import MonoIcon from "../../common/mono-icon";
import { format, addDays, endOfDay } from "date-fns"; // ⬅️ new

type ReferralProgramFormProps = {
  onSubmit: (fd: FormData) => void | Promise<void>;
  errorMessage?: string | null;
};

// Simple random code generator (avoids ambiguous chars)
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1
  let code = "";
  for (let i = 0; i < 8; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function NewReferralProgramForm({
  onSubmit,
  errorMessage,
}: ReferralProgramFormProps) {
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    setCode(generateCode());
  }, []);

  // ── Quick time presets helpers ────────────────────────────────────────
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
  // ─────────────────────────────────────────────────────────────────────

  return (
    <form action={onSubmit}>
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <MonoIcon>
                  <Megaphone className="size-4" aria-hidden="true" />
                </MonoIcon>
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Create Referral Program
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" aria-hidden="true" />
                Grow via invites
              </span>
              <span className="inline-flex items-center gap-1">
                <Gift className="h-4 w-4" aria-hidden="true" />
                Reward advocates & friends
              </span>
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/dashboard/referrals">Cancel</Link>
          </Button>
        </header>

        {/* Body */}
        <section className="space-y-10">
          {/* Program details */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">
              Program details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Invite & Earn"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="code">Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    name="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCode(generateCode())}
                    title="Generate random code"
                    aria-label="Generate random code"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Unique per account. Letters, numbers, dot, dash, or
                  underscore.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="pr-4">
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Make the program usable right away.
                  </p>
                </div>
                <Switch id="is_active" name="is_active" defaultChecked />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="per_referrer_cap">Per-referrer cap</Label>
                <Input
                  id="per_referrer_cap"
                  name="per_referrer_cap"
                  type="number"
                  min={1}
                  placeholder="Leave empty for unlimited"
                />
                <p className="text-[11px] text-muted-foreground">
                  Maximum successful referrals credited per participant. Empty =
                  unlimited.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Rewards */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">
              Rewards
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="referrer_reward">Referrer Reward</Label>
                <Input
                  id="referrer_reward"
                  name="referrer_reward"
                  placeholder="e.g., 1 stamp"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="referred_reward">Referred Reward</Label>
                <Input
                  id="referred_reward"
                  name="referred_reward"
                  placeholder="e.g., welcome gift"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Availability */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">
              Availability window
            </h3>

            {/* Quick range presets ABOVE the pickers */}
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="valid_from">Valid from</Label>
                <Input
                  id="valid_from"
                  name="valid_from"
                  type="datetime-local"
                  ref={fromRef}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="valid_to">Valid to</Label>
                <Input
                  id="valid_to"
                  name="valid_to"
                  type="datetime-local"
                  ref={toRef}
                />
              </div>
            </div>
          </section>

          {/* Error */}
          {errorMessage ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
        </section>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/referrals">Cancel</Link>
          </Button>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
