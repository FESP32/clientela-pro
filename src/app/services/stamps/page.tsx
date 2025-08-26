import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmt } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyStampCardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch all punches for this user, with the joined card info
  const { data: punches, error } = await supabase
    .from("stamp_punch")
    .select(
      `
      card_id,
      qty,
      created_at,
      card:stamp_card(
        id, title, goal_text, stamps_required, is_active, valid_from, valid_to
      )
    `
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-3xl">
        <CardHeader>
          <CardTitle>My Stamp Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const rows = punches ?? [];
  // Aggregate by card_id
  const byCard = new Map<
    string,
    {
      card: {
        id: string;
        title: string;
        goal_text: string;
        stamps_required: number;
        is_active: boolean;
        valid_from: string | null;
        valid_to: string | null;
      };
      totalQty: number;
      lastAt: string | null;
      completedAt: string | null;
    }
  >();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of rows as any[]) {
    const card = r.card;
    if (!card) continue; // safety
    const key = r.card_id as string;
    const prev = byCard.get(key);
    const newQty = (prev?.totalQty ?? 0) + (r.qty ?? 0);
    const lastAt =
      !prev?.lastAt || new Date(r.created_at) > new Date(prev.lastAt)
        ? r.created_at
        : prev.lastAt;
    // completed when totalQty reaches/exceeds required; mark completion time as lastAt
    const completedAt =
      typeof card.stamps_required === "number" && newQty >= card.stamps_required
        ? lastAt
        : prev?.completedAt ?? null;

    byCard.set(key, {
      card: {
        id: card.id,
        title: card.title,
        goal_text: card.goal_text,
        stamps_required: card.stamps_required,
        is_active: card.is_active,
        valid_from: card.valid_from ?? null,
        valid_to: card.valid_to ?? null,
      },
      totalQty: newQty,
      lastAt,
      completedAt,
    });
  }

  const items = Array.from(byCard.values());

  return (
    <div className="p-4">
      <Card className="max-w-6xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>My Stamp Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div>
                <p className="font-medium">No stamp cards yet</p>
                <p className="text-sm text-muted-foreground">
                  Scan a merchant QR or join a card to start collecting stamps.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/stamps">Browse</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[24%]">Title</TableHead>
                  <TableHead className="w-[28%]">Goal</TableHead>
                  <TableHead className="w-[14%]">Progress</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[12%]">Last Stamped</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(({ card, totalQty, lastAt, completedAt }) => {
                  const total = card.stamps_required ?? 1;
                  const pct = Math.round(
                    (Math.min(totalQty, total) / total) * 100
                  );
                  const isActiveNow = (() => {
                    const now = new Date();
                    const startsOk =
                      !card.valid_from || new Date(card.valid_from) <= now;
                    const endsOk =
                      !card.valid_to || now <= new Date(card.valid_to);
                    return card.is_active && startsOk && endsOk;
                  })();

                  return (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">
                        {card.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {card.goal_text}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {Math.min(totalQty, total)}/{total} ({pct}%)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {completedAt ? (
                          <Badge>Completed 🎉</Badge>
                        ) : isActiveNow ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmt(lastAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm">
                          <Link href={`/services/stamps/${card.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
