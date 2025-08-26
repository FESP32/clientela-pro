"use client";

import { useState } from "react";
import Link from "next/link";
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
import { MoreHorizontal, Eye, Link2, UserPlus, QrCode } from "lucide-react";
import { ReferralJoinLinkDialog } from "@/components/dashboard/referrals/referral-join-link-dialog";
import { fmt } from "@/lib/utils";
import { ReferralProgramRow } from "@/types";

export function ReferralProgramsTable({ programs }: { programs: ReferralProgramRow[] }) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  return (
    <>
      {/* Conditionally render the dialog only when open (prevents inert issues) */}
      {dlg && (
        <ReferralJoinLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          programTitle={dlg.title}
          joinPath={dlg.path}
          // If you ever see the page inert after close, toggle modal={false}
          // modal={false}
        />
      )}

      <div className="w-full overflow-x-auto">
        <Table className="min-w-[900px] md:min-w-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[26%]">Title</TableHead>
              <TableHead className="w-[14%]">Code</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[16%]">Referrer Reward</TableHead>
              <TableHead className="w-[16%]">Referred Reward</TableHead>
              <TableHead className="w-[16%]">Created</TableHead>
              <TableHead className="w-[10%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((p) => {
              const viewPath = `/dashboard/referrals/${p.id}`;
              const joinPath = `/services/referrals/referrer/${p.id}`;

              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {p.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.referrer_reward ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.referred_reward ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {typeof fmt === "function"
                      ? fmt(p.created_at)
                      : new Date(p.created_at).toLocaleString()}
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
                            <Eye className="h-4 w-4" />
                            View details
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            href={joinPath}
                            className="flex items-center gap-2"
                          >
                            <UserPlus className="h-4 w-4" />
                            Join as referrer
                          </Link>
                        </DropdownMenuItem>

                        {/* Open controlled dialog via state; no Dialog nested inside menu */}
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onSelect={() => {
                            // Let menu close before mounting the dialog (avoids focus quirks)
                            setTimeout(
                              () => setDlg({ title: p.title, path: joinPath }),
                              0
                            );
                          }}
                        >
                          <QrCode className="h-4 w-4" />
                          Show join URL
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        {/* Add more items here if needed (Edit, Deactivate, etc.) */}
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
