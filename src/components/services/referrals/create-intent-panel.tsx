"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  ProgramIntentQuota,
  ReferralIntentListMini,
  ReferralProgramRow,
} from "@/types";
import ReferrerIntentTable from "./referrer-intent-table";
import SubmitButton from "@/components/common/submit-button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

type Props = {
  program: Pick<
    ReferralProgramRow,
    "id" | "title" | "code" | "per_referrer_cap"
  >;
  quota: ProgramIntentQuota | null;
  intents: ReferralIntentListMini[] | null;
  onSubmit: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
};

export default function CreateIntentPanel({
  program,
  onSubmit,
  quota,
  intents,
}: Props) {
  const programId = program.id;

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Fallbacks for display when signed-out
  const cap =
    quota?.cap ??
    (typeof program.per_referrer_cap === "number"
      ? program.per_referrer_cap
      : null);
  const createdIntents = quota?.createdIntents ?? 0;
  const reachedCap = !!quota?.reachedCap;

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
    <section className="w-full mx-auto max-w-2xl md:max-w-6xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg md:text-xl font-semibold">Invite a friend</h2>

        <div className="flex flex-wrap items-center gap-2">
          {cap !== null ? (
            <Badge variant={reachedCap ? "outline" : "secondary"}>
              {createdIntents} / {cap}
            </Badge>
          ) : (
            <Badge variant="secondary">Created: {createdIntents}</Badge>
          )}
          {program.code ? (
            <Badge variant="secondary">Code: {program.code}</Badge>
          ) : null}
        </div>
      </header>

      {program.title ? (
        <div className="text-xs md:text-sm text-muted-foreground">
          Program: {program.title}
        </div>
      ) : null}

      {/* Create intent form / auth states */}
      <div className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="program_id" value={programId} />
          <SubmitButton />
        </form>
      </div>

      <Separator />

      {/* Intents list */}
      <section className="space-y-2">
        {intents && intents.length > 0 && (
          <div className="w-full overflow-x-auto">
            <ReferrerIntentTable intents={intents} />
          </div>
        )}
      </section>

      {/* Footer note */}
      <div className="text-xs text-muted-foreground">
        You can assign a customer to an invite later.
      </div>
    </section>
  );
}
