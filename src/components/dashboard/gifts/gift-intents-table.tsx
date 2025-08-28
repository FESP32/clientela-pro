// components/dashboard/gifts/gift-intents-table.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink } from "lucide-react";

import type { GiftIntentRow } from "@/types";

function fmt(ts?: string | null) {
  if (!ts) return "—";
  try {
    return format(new Date(ts), "PPp");
  } catch {
    return ts;
  }
}

export default function GiftIntentsTable({
  intents,
}: {
  intents: GiftIntentRow[];
}) {
  const [dlg, setDlg] = React.useState<{ title: string; path: string } | null>(
    null
  );

  return (
    <>
      {/* (Optional) future dialog; easy to wire when you add a claim/view route */}
      {/* {dlg && <YourGiftIntentDialog open onOpenChange={(o)=>!o && setDlg(null)} ... />} */}

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {intents.map((i) => {
          const viewPath = `/services/gifts/intent/${i.id}`; // adjust when you add a public/claim route
          return (
            <div key={i.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-xs break-all">{i.id}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        i.status === "pending"
                          ? "secondary"
                          : i.status === "consumed"
                          ? "default"
                          : i.status === "claimed"
                          ? "default"
                          : "outline"
                      }
                    >
                      {i.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {fmt(i.created_at)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Expires: {fmt(i.expires_at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Consumed: {fmt(i.consumed_at)}
                  </div>
                  <div className="text-xs">
                    Customer:{" "}
                    {i.customer_id ? (
                      <Badge variant="outline">{i.customer_id}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                      <Link href={viewPath} className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View intent
                      </Link>
                    </DropdownMenuItem>

                    {/* Example: Show link/QR dialog (wire when you have a claim URL) */}
                    {/* <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={() => setTimeout(() => setDlg({ title: i.id, path: viewPath }), 0)}
                    >
                      <QrCode className="h-4 w-4" />
                      Show link
                    </DropdownMenuItem> */}

                    <DropdownMenuSeparator />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Intent</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[20%]">Expires</TableHead>
              <TableHead className="w-[20%]">Consumed</TableHead>
              <TableHead className="w-[12%]">Customer</TableHead>
              <TableHead className="w-[8%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {intents.map((i) => {
              const viewPath = `/services/gifts/intent/${i.id}`;
              return (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs break-all">
                    {i.id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        i.status === "pending"
                          ? "secondary"
                          : i.status === "consumed"
                          ? "default"
                          : i.status === "claimed"
                          ? "default"
                          : "outline"
                      }
                    >
                      {i.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{fmt(i.expires_at)}</TableCell>
                  <TableCell className="text-xs">
                    {fmt(i.consumed_at)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {i.customer_id ? (
                      <Badge variant="outline">{i.customer_id}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Open actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                          <Link
                            href={viewPath}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View intent
                          </Link>
                        </DropdownMenuItem>

                        {/* <DropdownMenuItem
                          className="flex items-center gap-2"
                          onSelect={() => setTimeout(() => setDlg({ title: i.id, path: viewPath }), 0)}
                        >
                          <QrCode className="h-4 w-4" />
                          Show link
                        </DropdownMenuItem> */}

                        <DropdownMenuSeparator />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
