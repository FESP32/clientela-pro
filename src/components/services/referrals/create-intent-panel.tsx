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
} from "@/actions/referrals";
import Link from "next/link";
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
    <Card className="max-w-6xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
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
          <p className="text-sm text-muted-foreground">
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
            <Button asChild>
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
              <Input id="expires_at" name="expires_at" type="datetime-local" />
              <p className="text-xs text-muted-foreground">
                Leave empty to create an invite with no expiry.
              </p>
            </div>
            <Button type="submit">{cta}</Button>
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
            <IntentListTable intents={intents} />
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        You can assign a customer to an invite later.
      </CardFooter>
    </Card>
  );
}
