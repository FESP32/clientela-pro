// components/services/referrals/create-intent-panel.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  createReferralIntent,
  listMyProgramReferralIntents,
  getMyProgramIntentQuota,
} from "@/actions";
import type { ReferralProgramRow } from "@/types";
import ReferrerIntentTable from "./referrer-intent-table";
import SubmitButton from "@/components/common/submit-button";

type Props = {
  program: Pick<
    ReferralProgramRow,
    "id" | "title" | "code" | "per_referrer_cap"
  >;
  title?: string;
  cta?: string;
  action?: (fd: FormData) => Promise<void>;
};

export default async function CreateIntentPanel({
  program,
  title = "Invite a friend",
  action = createReferralIntent,
}: Props) {
  const programId = program.id;
  const supabase = await createClient();

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Quota based on *intents created* vs cap
  const quota = user ? await getMyProgramIntentQuota(programId) : null;

  // Fallbacks for display when signed-out
  const cap =
    quota?.cap ??
    (typeof program.per_referrer_cap === "number"
      ? program.per_referrer_cap
      : null);
  const createdIntents = quota?.createdIntents ?? 0;
  const reachedCap = !!quota?.reachedCap;

  // Intents list
  const intents = user
    ? await listMyProgramReferralIntents(programId, 20)
    : null;

  return (
    <section className="w-full mx-auto max-w-2xl md:max-w-6xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>

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
        {!user ? (
          <>
            <div className="text-sm text-muted-foreground">
              Sign in to create invites.
            </div>
            <Button asChild className="w-full md:w-auto">
              <Link
                href={`/login?next=/services/referrals/referrer/${programId}`}
              >
                Sign in
              </Link>
            </Button>
          </>
        ) : reachedCap ? (
          <>
            <div className="text-sm text-muted-foreground">
              You’ve reached the maximum number of invites you can create for
              this program.
            </div>
            <Button disabled className="w-full">
              Cap reached
            </Button>
          </>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="program_id" value={programId} />
            <SubmitButton />
          </form>
        )}
      </div>

      <Separator />

      {/* Intents list */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium">Your invites</h3>
        {!user ? (
          <div className="text-sm text-muted-foreground">
            Sign in to view your invites.
          </div>
        ) : !intents || intents.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No invites created yet.
          </div>
        ) : (
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
