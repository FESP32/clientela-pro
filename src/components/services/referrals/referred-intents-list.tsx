import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function ReferredIntentsList() {
  const supabase = await createClient();

  // who am I?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Your joined invites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Please sign in to see invites you’ve joined.
          </p>
          <Button asChild>
            <Link href="/login?next=/services/referrals/referred">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // fetch intents where I am the referred
  const { data: intents, error } = await supabase
    .from("referral_intents")
    .select(
      `
      id,
      status,
      created_at,
      consumed_at,
      expires_at,
      program_id,
      referral_program ( id, title )
    `
    )
    .eq("referred_id", user.id)
    .order("consumed_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {  
    return (
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Your joined invites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">Error: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const empty = !intents || intents.length === 0;

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Your joined invites</CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground">
            You haven’t joined any invites yet.
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Program</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[160px]">Joined</TableHead>
                  <TableHead className="min-w-[160px]">Created</TableHead>
                  <TableHead className="min-w-[140px]">Expires</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intents!.map((i) => {
                  const statusVariant =
                    i.status === "pending"
                      ? "secondary"
                      : i.status === "consumed"
                      ? "default"
                      : "outline";

                  return (
                    <TableRow key={i.id}>
                      <TableCell className="truncate">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(i.referral_program as any)?.title ?? "Referral Program"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {i.program_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <Badge variant={statusVariant as any}>{i.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {i.consumed_at
                          ? format(new Date(i.consumed_at), "PPp")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {i.created_at
                          ? format(new Date(i.created_at), "PPp")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {i.expires_at
                          ? format(new Date(i.expires_at), "PPp")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/services/referrals/referred/${i.id}`}>
                              Open
                            </Link>
                          </Button>
                          {i.program_id ? (
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/referrals/${i.program_id}`}>
                                Program
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
