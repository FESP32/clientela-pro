// components/auth/magic-link-login-form.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { sendMagicLink } from "@/actions"; // <- adjust if your path differs
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // or remove if you don't use this helper

type MagicLinkLoginFormProps = {
  next?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  successMessage?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
};

export default function MagicLinkLoginForm({
  next,
  title,
  subtitle,
  successMessage,
  className,
  autoFocus = true,
}: MagicLinkLoginFormProps) {
  const params = useSearchParams();
  const urlNext = params.get("next") || "";
  const effectiveNext = next ?? urlNext;

  const [state, formAction, isPending] = useActionState(sendMagicLink, null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) emailRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md "
        
      )}
    >
      <div className={"mb-3"}>
        {subtitle ?? (
          <p className="text-sm text-muted-foreground">
            We’ll send you a one-time sign-in link via email.
          </p>
        )}
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={effectiveNext} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            inputMode="email"
            ref={emailRef}
            required
            disabled={isPending}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Sending…" : "Send magic link"}
        </Button>

        <div role="status" aria-live="polite" className="min-h-5 text-sm">
          {state?.ok && (
            <p className="text-green-600">
              {successMessage ?? "Check your inbox for the sign-in link."}
            </p>
          )}
          {state?.error && <p className="text-red-600">{state.error}</p>}
        </div>
      </form>
    </div>
  );
}
