"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ReferralParticipantListItem,
} from "@/types";

export default function ReferralParticipantsList({
  programTitle,
  programCode,
  items,
}: {
  programTitle: string;
  programCode?: string;
  items: ReferralParticipantListItem[];
}) {
  return (
    <Card className="max-w-6xl">
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>
          Participants — {programTitle}{" "}
          {programCode ? (
            <Badge variant="secondary" className="align-middle ml-2">
              {programCode}
            </Badge>
          ) : null}
        </CardTitle>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/referrals`}>Back to Programs</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg border p-6">
            <p className="font-medium mb-1">No participants yet</p>
            <p className="text-sm text-muted-foreground">
              Share your program code or invite customers to join.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Customer</TableHead>
                <TableHead className="w-[12%]">Referred Count</TableHead>
                <TableHead className="w-[30%]">Note</TableHead>
                <TableHead className="w-[14%]">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.customer_name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {row.referred_qty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.note ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()}
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
