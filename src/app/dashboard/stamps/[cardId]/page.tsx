import Link from "next/link";
import { notFound } from "next/navigation";
import { listStampIntents, createStampIntent } from "@/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default async function CardIntentsPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  const { user, card, intents, error } = await listStampIntents(cardId);

  if (!user) {
    notFound();
  }

  if (error || !card) {
    return (
      <Card className="mx-auto mt-10 max-w-3xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Card Intents</CardTitle>
          <Button asChild>
            <Link href="/services/cards">Back to Cards</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load: {error ?? "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const pending = intents.filter((i) => i.status === "pending").length;

  return (
    <div className="p-4">
      <Card className="max-w-6xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>
            Intents — {card.title}{" "}
            <span className="ml-2 align-middle">
              <Badge variant="secondary">{intents.length} total</Badge>
              <span className="mx-1" />
              <Badge>{pending} pending</Badge>
            </span>
          </CardTitle>
          <Button asChild variant="outline">
            <Link href="/dashboard/stamps">Back to Cards</Link>
          </Button>
        </CardHeader>

        <CardContent>
          <form
            action={createStampIntent}
            className="mb-4 flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="card_id" value={cardId} />
            <div className="flex items-center gap-2">
              <label className="text-sm">Qty</label>
              <Input
                type="number"
                name="qty"
                min={1}
                defaultValue={1}
                className="h-8 w-20"
                aria-label="Intent quantity"
              />
            </div>
            <Input
              type="text"
              name="customer_id"
              placeholder="Customer UUID (optional)"
              className="h-8 w-56"
            />
            <Input
              type="datetime-local"
              name="expires_at"
              className="h-8"
              aria-label="Expires at"
            />
            <Input
              type="text"
              name="note"
              placeholder="Note (optional)"
              className="h-8 w-64"
            />
            <Button size="sm" type="submit" variant="secondary">
              Create Intent
            </Button>
          </form>

          {intents.length === 0 ? (
            <div className="rounded-lg border p-6">
              <p className="mb-1 font-medium">No intents yet</p>
              <p className="text-sm text-muted-foreground">
                Use the form above to create a new intent for this card.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[12%]">Created</TableHead>
                  <TableHead className="w-[10%]">Qty</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[18%]">Customer</TableHead>
                  <TableHead className="w-[18%]">Expires</TableHead>
                  <TableHead className="w-[18%]">Consumed</TableHead>
                  <TableHead className="w-[12%]">Note</TableHead>
                  <TableHead className="w-[10%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intents.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(i.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{i.qty}</Badge>
                    </TableCell>
                    <TableCell>
                      {i.status === "pending" ? (
                        <Badge>Pending</Badge>
                      ) : i.status === "consumed" ? (
                        <Badge variant="secondary">Consumed</Badge>
                      ) : (
                        <Badge variant="outline">Canceled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {i.customer_name ? (
                        i.customer_name
                      ) : i.customer_id ? (
                        i.customer_id
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(i.expires_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(i.consumed_at)}
                    </TableCell>
                    <TableCell className="max-w-[14rem] truncate text-sm">
                      {i.note ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/services/stamps/intents/${i.id}`}>
                          View
                        </Link>
                      </Button>
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
