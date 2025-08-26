import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { listBusinessGifts } from "@/actions/gifts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function GiftsPage() {
  const { user, gifts, error } = await listBusinessGifts();

  if (!user) {
    return (
      <div className="p-4">
        <Card className="w-full max-w-6xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your gifts</CardTitle>
            <Button asChild>
              <Link href="/login?next=/dashboard/gifts">Sign in</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please sign in to view your gifts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="w-full max-w-6xl">
          <CardHeader>
            <CardTitle>Your gifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const empty = gifts.length === 0;

  return (
    <div className="p-4">
      <Card className="w-full max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Your gifts</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{gifts.length} total</Badge>
            <Button asChild>
              <Link href="/dashboard/gifts/new">New gift</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {empty ? (
            <div className="text-sm text-muted-foreground">
              You haven’t created any gifts yet. Create your first one.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[80px]">Image</TableHead>
                    <TableHead className="min-w-[220px]">Title</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gifts.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        {g.image_url ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                            <Image
                              src={g.image_url}
                              alt={g.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-md border grid place-items-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{g.title}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/gifts/${g.id}`}>Open</Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/gifts/${g.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
