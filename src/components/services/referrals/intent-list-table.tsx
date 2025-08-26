"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, Link2, QrCode } from "lucide-react";
import { ReferralIntentLinkDialog } from "@/components/services/referrals/referral-intent-link-dialog";
import type { ReferralIntentListMini } from "@/types";

export function IntentListTable({
  intents,
}: {
  intents: ReferralIntentListMini[];
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  return (
    <>
      {/* Controlled dialog rendered outside dropdown to avoid unmount issues */}
      {dlg && (
        <ReferralIntentLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          intentTitle={dlg.title}
          intentPath={dlg.path}
          // If you ever see the page inert after close, toggle modal={false}
          // modal={false}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Intent ID</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[18%]">Created</TableHead>
              <TableHead className="w-[18%]">Expires</TableHead>
              <TableHead className="w-[10%]">Assigned</TableHead>
              <TableHead className="w-[12%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intents.map((i) => {
              const referredPath = `/services/referrals/referred/${i.id}`;
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
                          : "outline"
                      }
                    >
                      {i.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(i.created_at), "PPp")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {i.expires_at ? format(new Date(i.expires_at), "PPp") : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {i.referred_id ? "Yes" : "No"}
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
                            href={referredPath}
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open as referred
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onSelect={() => {
                            // Let the menu close fully, then mount the dialog (avoids focus quirks)
                            setTimeout(
                              () => setDlg({ title: i.id, path: referredPath }),
                              0
                            );
                          }}
                        >
                          <QrCode className="h-4 w-4" />
                          Show link
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        {/* room for more actions (Copy ID, Cancel, etc.) */}
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
