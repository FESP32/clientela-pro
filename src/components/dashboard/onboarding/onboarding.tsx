"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { setOnboardingCookie } from "@/actions";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

/* ---------- Types ---------- */
export type OnboardingStep = {
  /** Short step title for the header/timeline */
  title: string;
  /** Optional helper text shown under the title */
  description?: string;
  /** Your custom JSX for this step (forms, checklists, etc.) */
  content: React.ReactNode;
};

export type OnboardingProps = {
  /** Steps to render in the flow */
  steps: OnboardingStep[];
  /** Shown the first time if true; you should pass server-read cookie result for control */
  openByDefault?: boolean;
  /** Cookie name (version this when you change the flow) */
  cookieName?: string;
  /** Render as a dialog (modal) or an inline card section */
  variant?: "modal" | "inline";
  /** Optional overall title/subtitle */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Classname for root wrapper */
  className?: string;
  /** Called when user completes onboarding (after cookie has been set) */
  onComplete?: () => void;
};

/* ---------- Component ---------- */
export default function Onboarding({
  steps,
  openByDefault = false,
  cookieName = "onboarding_done_v1",
  variant = "modal",
  title,
  subtitle,
  className,
  onComplete,
}: OnboardingProps) {
  const [open, setOpen] = useState(openByDefault);
  const [index, setIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const total = steps.length;
  const current = steps[index];

  function next() {
    setIndex((i) => Math.min(i + 1, total - 1));
  }
  function prev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  /** Finish: set cookie via server action, then close */
  function finish() {
    startTransition(async () => {
      await setOnboardingCookie(cookieName);
      setOpen(false);
      onComplete?.();
    });
  }

  const Body = (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="space-y-2">
        {title ? (
          <div className="space-y-1">
            <div className="text-xl font-semibold tracking-tight">{title}</div>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        {/* Step header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-medium">{current.title}</h3>
            {current.description ? (
              <p className="text-sm text-muted-foreground">
                {current.description}
              </p>
            ) : null}
          </div>

          {/* Progress */}
          <div className="w-40">
            <Progress
              value={((index + 1) / total) * 100}
              aria-label="Progress"
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {index + 1} / {total}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Content */}
      <div className="min-h-36">{current.content}</div>

      {/* Footer actions */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={prev}
          disabled={index === 0 || isPending}
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          {/* Optional Skip silently finishes early */}
          {index < total - 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={finish}
              disabled={isPending}
            >
              Skip for now
            </Button>
          )}
          {index < total - 1 ? (
            <Button type="button" onClick={next} disabled={isPending}>
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={finish}
              disabled={isPending}
              aria-label="Finish onboarding"
            >
              {isPending ? "Finishing..." : "Finish"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (variant === "inline") {
    return (
      <section
        aria-label="Onboarding"
        className={cn(
          "rounded-2xl border bg-background p-6 shadow-sm",
          open ? "block" : "hidden"
        )}
      >
        {Body}
      </section>
    );
  }

  // Default: modal
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Welcome</DialogTitle>
          <DialogDescription className="sr-only">
            Complete onboarding
          </DialogDescription>
        </DialogHeader>
        {Body}
      </DialogContent>
    </Dialog>
  );
}
