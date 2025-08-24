"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = {
  id: string;
  title: string;
  code: string;
  is_active: boolean;
  referrer_reward: string | null;
  referred_reward: string | null;
  valid_from: string | null;
  valid_to: string | null;
  joined_at: string;
};

export default function JoinedReferralProgramsList({
  items,
}: {
  items: Row[];
}) {
  return (
    <Card className="mx-auto max-w-6xl">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Your Joined Referral Programs</CardTitle>
        <Button asChild variant="outline">
          <Link href="/referrals">Browse Programs</Link>
        </Button>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg border p-6">
            <p className="font-medium mb-1">
              You haven’t joined any programs yet
            </p>
            <p className="text-sm text-muted-foreground">
              Find a referral program and join to start earning rewards.
            </p>
            <Button asChild className="mt-4">
              <Link href="/referrals">Explore Programs</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Program</TableHead>
                <TableHead className="w-[12%]">Code</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[18%]">Referrer Reward</TableHead>
                <TableHead className="w-[18%]">Referred Reward</TableHead>
                <TableHead className="w-[12%]">Joined</TableHead>
                <TableHead className="w-[10%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {p.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.referrer_reward ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.referred_reward ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(p.joined_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/services/referrals/referrer/${p.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
