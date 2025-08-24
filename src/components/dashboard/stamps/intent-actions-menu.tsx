"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, QrCode } from "lucide-react";

/**
 * Actions for a single intent row.
 * - View page (link)
 * - Show QR (opens dialog with QR code that points to `href`)
 */
export function IntentActionsMenu({ href }: { href: string }) {
  const [open, setOpen] = React.useState(false);

  // Simple, dependency-free QR via public API.
  // If you prefer a local lib, swap this <img> for `qrcode.react` or similar.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    href
  )}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={href} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setOpen(true)}
          >
            <QrCode className="h-4 w-4" />
            Show QR
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Scan to open</DialogTitle>
            <DialogDescription className="break-all">{href}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="QR code to open intent"
              className="h-60 w-60 rounded-md border"
            />
          </div>

          <DialogFooter className="flex w-full justify-end">
            <Button asChild>
              <Link href={href}>Open page</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
