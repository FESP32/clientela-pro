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
import { MoreHorizontal, Eye, UserPlus, QrCode } from "lucide-react";
import { ReferralJoinLinkDialog } from "@/components/dashboard/referrals/referral-join-link-dialog";
import { fmt } from "@/lib/utils";
import type { ReferralProgramRow } from "@/types";

export function ReferralProgramsTable({
  programs,
}: {
  programs: ReferralProgramRow[];
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  return (
    <>
      {/* Dialog only mounts when needed */}
      {dlg && (
        <ReferralJoinLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          programTitle={dlg.title}
          joinPath={dlg.path}
        />
      )}

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {programs.map((p) => {
          const viewPath = `/dashboard/referrals/${p.id}`;
          const joinPath = `/services/referrals/referrer/${p.id}`;

          return (
            <div key={p.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.title}</div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{p.code}</Badge>
                    {p.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                    <div className="text-muted-foreground">
                      <span className="mr-1">Referrer:</span>
                      <span className="text-foreground">
                        {p.referrer_reward ?? "—"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      <span className="mr-1">Referred:</span>
                      <span className="text-foreground">
                        {p.referred_reward ?? "—"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Created {fmt(p.created_at)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open actions"
                      className="shrink-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuItem asChild>
                      <Link href={viewPath} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View details
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={joinPath} className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Join as referrer
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onSelect={() =>
                        setTimeout(
                          () => setDlg({ title: p.title, path: joinPath }),
                          0
                        )
                      }
                    >
                      <QrCode className="h-4 w-4" />
                      Show join URL
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block w-full overflow-x-auto">
        <Table>
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
                    {fmt(p.created_at)}
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

                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onSelect={() =>
                            setTimeout(
                              () => setDlg({ title: p.title, path: joinPath }),
                              0
                            )
                          }
                        >
                          <QrCode className="h-4 w-4" />
                          Show join URL
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        {/* Place more actions here if needed */}
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
