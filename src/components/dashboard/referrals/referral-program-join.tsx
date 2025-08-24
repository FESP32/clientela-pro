import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import CreateIntentPanel from "@/components/services/referrals/create-intent-panel";
import { createReferralIntent, getProgramJoinData } from "@/actions/referrals";

type Props = {
  programId: string;
  action: (fd: FormData) => Promise<void>;
  cta?: string;
};

export const dynamic = "force-dynamic";

export default async function ProgramJoin({
  programId,
  action,
  cta = "Join program",
}: Props) {
  const res = await getProgramJoinData(programId);

  if (!res.ok) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{res.message}</p>
        </CardContent>
      </Card>
    );
  }

  const { userId, program, participantCount, alreadyJoined } = res;
  const isActive = !!program.is_active;

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

  return (
    <div className="space-y-6">
      {!alreadyJoined && (
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{program.title}</CardTitle>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Program code: <span className="font-mono">{program.code}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Referrer reward</div>
                <div className="text-sm text-muted-foreground">
                  {program.referrer_reward || "—"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Referred reward</div>
                <div className="text-sm text-muted-foreground">
                  {program.referred_reward || "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Validity</div>
                <div className="text-sm text-muted-foreground">{validity}</div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Per-referrer cap</div>
                <div className="text-sm text-muted-foreground">
                  {program.per_referrer_cap ?? "Unlimited"}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Participants:{" "}
                <span className="font-medium">{participantCount}</span>
              </div>
              {!userId ? (
                <div className="text-muted-foreground">
                  Please{" "}
                  <Link
                    href={`/login?next=/referrals/${programId}/join`}
                    className="underline"
                  >
                    sign in
                  </Link>{" "}
                  to join.
                </div>
              ) : alreadyJoined ? (
                <div className="text-green-600">
                  You’re already a participant.
                </div>
              ) : null}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            {!userId ? (
              <Button asChild>
                <Link href={`/login?next=/referrals/${programId}/join`}>
                  Sign in
                </Link>
              </Button>
            ) : (
              <form action={action}>
                <input type="hidden" name="program_id" value={programId} />
                <Button type="submit" disabled={!isActive || alreadyJoined}>
                  {alreadyJoined
                    ? "Already joined"
                    : isActive
                    ? cta
                    : "Program inactive"}
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Inline intent panel when already joined */}
      {userId && alreadyJoined ? (
        <CreateIntentPanel
          program={program}
          action={createReferralIntent}
          title="Invite a friend"
          cta="Create intent"
        />
      ) : null}
    </div>
  );
}
