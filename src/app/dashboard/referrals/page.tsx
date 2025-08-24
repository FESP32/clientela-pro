import Link from "next/link";
import { listReferralPrograms } from "@/actions/referrals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ReferralProgramsTable } from "@/components/dashboard/referrals/referral-table";

export const dynamic = "force-dynamic";

export default async function ReferralProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/referrals");

  const programs = await listReferralPrograms();

  return (
    <div className="p-4">
      <Card className="max-w-6xl">
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Referral Programs</CardTitle>
          <Button asChild>
            <Link href="/dashboard/referrals/new">New Program</Link>
          </Button>
        </CardHeader>

        <CardContent>
          {programs.length === 0 ? (
            <div className="rounded-lg border p-6">
              <p className="font-medium mb-1">No referral programs yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first program to start inviting customers.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/referrals/new">Create Program</Link>
              </Button>
            </div>
          ) : (
            <ReferralProgramsTable programs={programs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
