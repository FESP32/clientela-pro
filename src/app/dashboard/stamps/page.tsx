import Link from "next/link";
import {
  listStampCards,
  deleteStampCard,
} from "@/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default async function LoyaltyCardsPage() {
  const { user, cards, error } = await listStampCards();

  if (!user) {
    return (
      <Card className="mt-10 max-w-6xl">
        <CardHeader>
          <CardTitle>Loyalty Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You must be signed in to view your loyalty cards.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto mt-10 max-w-3xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Loyalty Cards</CardTitle>
          <Button asChild>
            <Link href="/dashboard/loyalty/cards/new">New Card</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Card className="max-w-6xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Your Loyalty Cards</CardTitle>
          <Button asChild>
            <Link href="/dashboard/loyalty/cards/new">New Card</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <div className="flex items-center justify-between rounded-lg border p-6">
              <div>
                <p className="font-medium">No loyalty cards yet</p>
                <p className="text-sm text-muted-foreground">
                  Create your first stamp card to get started.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/loyalty/cards/new">Create Card</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[26%]">Title</TableHead>
                  <TableHead className="w-[26%]">Goal</TableHead>
                  <TableHead className="w-[10%]">Stamps</TableHead>
                  <TableHead className="w-[10%]">Products</TableHead>
                  <TableHead className="w-[16%]">Validity</TableHead>
                  <TableHead className="w-[8%]">Status</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.goal_text}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.stamps_required}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.product_count ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(c.valid_from)} — {fmt(c.valid_to)}
                    </TableCell>
                    <TableCell>
                      {c.is_active ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      {/* Customer join flow (if you keep it) */}
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/services/stamps/${c.id}/join`}>
                          Stamp
                        </Link>
                      </Button>

                      {/* Manage intents for this card (moved here) */}
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/dashboard/stamps/${c.id}`}>
                          Manage Intents
                        </Link>
                      </Button>

                      {/* Delete */}
                      <form action={deleteStampCard.bind(null, c.id)}>
                        <Button size="sm" variant="destructive" type="submit">
                          Delete
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
