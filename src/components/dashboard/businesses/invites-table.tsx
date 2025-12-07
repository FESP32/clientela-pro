// components/dashboard/businesses/invites-table.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Copy, MoreHorizontal, QrCode } from "lucide-react";
import RoleBadge from "@/components/dashboard/businesses/role-badge";
import { fmt } from "@/lib/utils";
import { InviteLinkDialog } from "./invite-link-dialog";

type InviteItem = {
  id: string;
  role: string;
  status: string;
  inviter?: { name: string | null } | null;
  invitee?: { name: string | null } | null;
  created_at: string;
  updated_at: string;
};

export default function InvitesTable({
  invites,
  businessName,
  publicLinkPrefix = "/invite",
}: {
  invites: InviteItem[];
  businessName: string;
  publicLinkPrefix?: string;
}) {
  const [linkDialog, setLinkDialog] = useState<{
    title: string;
    path: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopyLink(inviteId: string) {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${publicLinkPrefix}/${inviteId}`
        : `${publicLinkPrefix}/${inviteId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* noop */
    }
  }

  if (!invites.length) {
    return <p className="text-sm text-muted-foreground">No invites yet.</p>;
  }

  return (
    <>
      {linkDialog && (
        <InviteLinkDialog
          open={true}
          onOpenChange={(open) => !open && setLinkDialog(null)}
          businessName={linkDialog.title}
          invitePath={linkDialog.path}
        />
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10px]">#</TableHead>
              <TableHead className="w-[120px]">Role</TableHead>
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead className="w-[200px]">Invited by</TableHead>
              <TableHead className="w-[200px]">Accepted by</TableHead>
              <TableHead className="w-[160px]">Created</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((i, idx) => {
              const openHref = `${publicLinkPrefix}/${i.id}`;
              const copied = copiedId === i.id;

              return (
                <TableRow key={i.id}>
                  <TableCell className="text-xs">{idx + 1}</TableCell>
                  <TableCell className="capitalize">
                    <RoleBadge role={i.role} />
                  </TableCell>
                  <TableCell className="capitalize">{i.status}</TableCell>
                  <TableCell>{i.inviter?.name ?? "—"}</TableCell>
                  <TableCell>{i.invitee?.name ?? "—"}</TableCell>
                  <TableCell>{fmt(i.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Open actions"
                          className="hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={openHref}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open invite
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onSelect={() => {
                            // Let the menu close, then mount dialog
                            setTimeout(
                              () =>
                                setLinkDialog({
                                  title: businessName,
                                  path: `${publicLinkPrefix}/${i.id}`,
                                }),
                              0
                            );
                          }}
                          className="cursor-pointer"
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Show invite URL
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleCopyLink(i.id)}
                          className="cursor-pointer"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {copied ? "Link copied!" : "Copy link"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* SR-only live region for copy feedback */}
        <span className="sr-only" aria-live="polite">
          {copiedId ? "Invite link copied to clipboard" : ""}
        </span>
      </div>
    </>
  );
}
