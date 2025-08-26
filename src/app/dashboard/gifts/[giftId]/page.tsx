import Link from "next/link";
import { notFound } from "next/navigation";
import { listGiftIntents, createGiftIntent } from "@/actions/gifts";
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
import { IntentActionsMenu } from "@/components/dashboard/stamps/intent-actions-menu";

export const dynamic = "force-dynamic";

export default async function GiftIntentsPage({
  params,
}: {
  params: Promise<{ giftId: string }>;
}) {
  const { giftId } = await params;

  const { user, gift, intents, error } = await listGiftIntents(giftId);

  if (!user) {
    notFound();
  }

  if (error || !gift) {
    return (
      <Card className="mx-auto mt-10 max-w-3xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Gift Intents</CardTitle>
          <Button asChild>
            <Link href="/dashboard/gifts">Back to Gifts</Link>
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
            Intents — {gift.title}{" "}
            <span className="ml-2 align-middle">
              <Badge variant="secondary">{intents.length} total</Badge>
              <span className="mx-1" />
              <Badge>{pending} pending</Badge>
            </span>
          </CardTitle>
          <Button asChild variant="outline">
            <Link href="/dashboard/gifts">Back to Gifts</Link>
          </Button>
        </CardHeader>

        <CardContent>
          {/* Create new gift intents */}
          <form
            action={createGiftIntent}
            className="mb-4 flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="gift_id" value={giftId} />

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
            <Button size="sm" type="submit" variant="secondary">
              Create Intent
            </Button>
          </form>

          {intents.length === 0 ? (
            <div className="rounded-lg border p-6">
              <p className="mb-1 font-medium">No intents yet</p>
              <p className="text-sm text-muted-foreground">
                Use the form above to create a new intent for this gift.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[16%]">Created</TableHead>
                  <TableHead className="w-[14%]">Status</TableHead>
                  {/* <TableHead className="w-[22%]">Customer</TableHead> */}
                  <TableHead className="w-[22%]">Expires</TableHead>
                  <TableHead className="w-[22%]">Consumed</TableHead>
                  <TableHead className="w-[12%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intents.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(i.created_at)}
                    </TableCell>
                    <TableCell>
                      {i.status === "pending" ? (
                        <Badge>Pending</Badge>
                      ) : i.status === "consumed" ? (
                        <Badge variant="secondary">Consumed</Badge>
                      ) : i.status === "claimed" ? (
                        <Badge variant="secondary">Claimed</Badge>
                      ) : (
                        <Badge variant="outline">Canceled</Badge>
                      )}
                    </TableCell>
                    {/* <TableCell className="text-sm">
                      {i.customer_name ? (
                        i.customer_name
                      ) : i.customer_id ? (
                        i.customer_id
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell> */}
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(i.expires_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmt(i.consumed_at)}
                    </TableCell>

                    {/* Actions → dropdown with QR modal */}
                    <TableCell className="text-right">
                      <IntentActionsMenu
                        href={`/services/gifts/referred/${i.id}`}
                      />
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
