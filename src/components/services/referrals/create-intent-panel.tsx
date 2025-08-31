import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { IntentListTable } from "./intent-list-table";

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
  cta = "Create intent",
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
    <Card className="w-full max-w-2xl md:max-w-6xl">
      <CardHeader>
        {/* Mobile-first header: stack content; spread on md+ */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>

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
        </div>

        {program.title ? (
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Program: {program.title}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Create intent form */}
        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in to create invites.
            </p>
            <Button asChild className="w-full md:w-auto">
              <Link
                href={`/login?next=/services/referrals/referrer/${programId}`}
              >
                Sign in
              </Link>
            </Button>
          </div>
        ) : reachedCap ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You’ve reached the maximum number of invites you can create for
              this program.
            </p>
            <Button disabled className="w-full">
              Cap reached
            </Button>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="program_id" value={programId} />
            <div className="space-y-2">
              <Label htmlFor="expires_at">Expires at (optional)</Label>
              <Input
                id="expires_at"
                name="expires_at"
                type="datetime-local"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to create an invite with no expiry.
              </p>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              {cta}
            </Button>
          </form>
        )}

        <Separator />

        {/* Intents list */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your invites</h3>
          {!user ? (
            <p className="text-sm text-muted-foreground">
              Sign in to view your invites.
            </p>
          ) : !intents || intents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No invites created yet.
            </p>
          ) : (
            // Ensure the table within IntentListTable can scroll on small screens
            <div className="w-full overflow-x-auto">
              <IntentListTable intents={intents} />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        You can assign a customer to an invite later.
      </CardFooter>
    </Card>
  );
}
