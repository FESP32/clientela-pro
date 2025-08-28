import Link from "next/link";
import { listStampCards, deleteStampCard } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StampCardsTable } from "@/components/dashboard/stamps/stamp-cards-table";

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
            <Link href="/dashboard/stamps/new">New Card</Link>
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
            <Link href="/dashboard/stamps/new">New Card</Link>
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
            <StampCardsTable cards={cards} deleteStampCard={deleteStampCard} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
