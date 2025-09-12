"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import SubmitButton from "../../common/submit-button";
import MonoIcon from "@/components/common/mono-icon";
import { useRouter } from "next/navigation";

import {
  Gift as GiftIcon,
  FileText,
  Info,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
};

export default function GiftCreate({ onSubmit }: Props) {

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/gifts");
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
                <GiftIcon className="size-4" aria-hidden="true" />
              </MonoIcon>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Create Gift
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Give it a clear title & description
              </span>
            </p>
          </div>
        </header>

        {/* Body */}
        <section className="space-y-10">
          {/* Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">
              Gift details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Free Month"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Keep it short and recognisable (under ~40 chars works best).
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Info
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Description (optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what’s included and any limits…"
                className="min-h-[120px]"
              />
              <p className="text-[11px] text-muted-foreground">
                Mention eligibility, redemption steps, or exclusions if needed.
              </p>
            </div>
          </section>

          <Separator />

          <div className="mt-2 flex items-center gap-3">
            <SubmitButton />
            <Button asChild variant="outline">
              <Link href="/dashboard/gifts">Cancel</Link>
            </Button>
          </div>
        </section>
      </div>
    </form>
  );
}
