// app/dashboard/gifts/my/page.tsx
import Image from "next/image";
import Link from "next/link";
import { listMyGiftIntents } from "@/actions/gifts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const statusVariant = (s: string) =>
  s === "claimed"
    ? "default"
    : s === "consumed"
    ? "secondary"
    : s === "pending"
    ? "outline"
    : "destructive";

export default async function MyGiftsPage() {
  const { data, error } = await listMyGiftIntents();

  if (error) {
    return (
      <div className="p-4 flex justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>My Gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter>
            <Link href="/signin">
              <Button>Sign in</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="p-4 flex justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>My Gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You don’t have any gifts yet.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">My Gifts</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((row) => {
          const b = row.gift?.business;
          return (
            <Card key={row.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {row.gift?.title ?? "Gift"}
                </CardTitle>
                <Badge variant={statusVariant(row.status)} className="text-xs">
                  {row.status.toUpperCase()}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                {row.gift?.image_url ? (
                  <div className="relative w-full h-40 rounded-md overflow-hidden border">
                    <Image
                      src={row.gift.image_url}
                      alt={row.gift.title ?? "Gift image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <div className="text-sm text-muted-foreground space-y-1">
                  {row.gift?.description ? (
                    <p className="line-clamp-3">{row.gift.description}</p>
                  ) : null}
                  <div>
                    <span className="font-medium text-foreground">
                      Business:{" "}
                    </span>
                    {b?.name ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      Received:{" "}
                    </span>
                    {new Date(row.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">
                      Expires:{" "}
                    </span>
                    {row.expires_at
                      ? new Date(row.expires_at).toLocaleString()
                      : "No expiry"}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex items-center justify-between">
                <Link href={`/dashboard/gifts/intent/${row.id}`}>
                  <Button variant="outline" size="sm">
                    View intent
                  </Button>
                </Link>
                <Link href={`/dashboard/gifts/${row.gift_id}`}>
                  <Button size="sm">View gift</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
