// components/services/referrals/program-join.tsx
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SubmitButton from "../../common/submit-button";
import CreateIntentPanel from "@/components/services/referrals/create-intent-panel";
import { createReferralIntent, getMyProgramIntentQuota, getProgramJoinData, listMyProgramReferralIntents } from "@/actions";
import CustomerListSection from "@/components/common/customer-list-section";
import {
  BadgePercent,
  Users,
  Clock3,
  ShieldCheck,
  KeySquare,
  LogIn,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server"; // ⬅️ early auth gate
import { notFound } from "next/navigation";

type Props = {
  programId: string;
  action: (fd: FormData) => Promise<void>;
};

export const dynamic = "force-dynamic";

export default async function ProgramJoin({ programId, action }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loginNext = `/services/referrals/referrer/${programId}/join`;

  if (!user) {
    // Minimal, premium prompt asking the user to sign in (no program query yet)
    return (
      <CustomerListSection
        kicker="Referrals"
        title="Join program"
        subtitle="Please sign in to view and join this referral program."
        divider
        actions={
          <Button asChild size="sm">
            <Link href={`/login?next=${encodeURIComponent(loginNext)}`}>
              <LogIn className="mr-1.5 h-4 w-4" />
              Sign in to continue
            </Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground text-center">
          You’ll return here after signing in.
        </p>
      </CustomerListSection>
    );
  }

  const res = await getProgramJoinData(programId);

  if (!res.ok) {
    return (
      <CustomerListSection
        kicker="Referrals"
        title="Join program"
        subtitle="We couldn’t load this referral program."
        divider
      >
        <div className="mx-auto max-w-2xl">
          <div className="text-sm text-muted-foreground">{res.message}</div>
        </div>
      </CustomerListSection>
    );
  }

  const { program, participantCount, alreadyJoined } = res;
  const isActive = program.status === "active";

  if (!isActive) {
    notFound();
  }

  const validity =
    program.valid_from || program.valid_to
      ? [
          program.valid_from
            ? `from ${format(new Date(program.valid_from), "PPp")}`
            : "",
          program.valid_to
            ? `until ${format(new Date(program.valid_to), "PPp")}`
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      : "No date restrictions";

  const quota = user ? await getMyProgramIntentQuota(programId) : null;
  const intents = user
    ? await listMyProgramReferralIntents(programId, 20)
    : null;

  return (
    <CustomerListSection
      kicker="Referrals"
      title={
        <div className="inline-flex items-center gap-2">
          <BadgePercent className="h-6 w-6 text-foreground/80" />
          <span className="truncate">{program.title}</span>
          <Badge variant={isActive ? "default" : "secondary"} className="ml-1">
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      }
      subtitle={
        <>
          <span className="inline-flex items-center gap-1">
            <KeySquare className="h-4 w-4" />
            <span>Code: </span>
            <span className="font-mono text-foreground">{program.code}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            <span>{validity}</span>
          </span>
        </>
      }
      divider
      actions={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {participantCount} participants
          </Badge>
          {alreadyJoined ? (
            <Badge className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              You’ve joined
            </Badge>
          ) : null}
        </div>
      }
      contentClassName="space-y-6"
    >
      {!alreadyJoined && (
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Heading */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{program.title}</h3>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span>Program code: </span>
              <span className="font-mono">{program.code}</span>
            </div>
          </div>

          {/* Details (semantic, no card styles) */}
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-sm font-medium">Referrer reward</dt>
              <dd className="text-sm text-muted-foreground">
                {program.referrer_reward || "—"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium">Referred reward</dt>
              <dd className="text-sm text-muted-foreground">
                {program.referred_reward || "—"}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium">Validity</dt>
              <dd className="text-sm text-muted-foreground">{validity}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-sm font-medium">Per-referrer cap</dt>
              <dd className="text-sm text-muted-foreground">
                {program.per_referrer_cap ?? "Unlimited"}
              </dd>
            </div>
          </dl>

          <Separator />

          {/* Participants + state hint */}
          <div className="flex flex-col items-start justify-between gap-2 text-sm sm:flex-row sm:items-center">
            <div className="text-muted-foreground">
              <span>Participants: </span>
              <span className="font-medium">{participantCount}</span>
            </div>

            {alreadyJoined ? (
              <div className="text-green-600">
                You’re already a participant.
              </div>
            ) : null}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <form action={action}>
              <input type="hidden" name="program_id" value={programId} />
              <SubmitButton disabled={!isActive || alreadyJoined} />
            </form>
          </div>
        </div>
      )}

      {alreadyJoined ? (
        <CreateIntentPanel
          program={program}
          onSubmit={createReferralIntent}
          quota={quota}
          intents={intents}
        />
      ) : null}
    </CustomerListSection>
  );
}
