"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, QrCode } from "lucide-react";
import { IntentLinkDialog } from "@/components/dashboard/stamps/intent-link-dialog";

/**
 * Actions for a single intent row (no Dialog nested inside the menu).
 * - View page
 * - Show QR (opens controlled dialog outside the menu)
 */
export function IntentActionsMenu({
  href,
  viewLabel = "View",
  dialogTitle = "Scan to open",
}: {
  href: string;
  viewLabel?: string;
  dialogTitle?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Controlled dialog, mounted outside the menu */}
      {open && (
        <IntentLinkDialog
          open={open}
          onOpenChange={(o) => setOpen(o)}
          href={href}
          title={dialogTitle}
          // If your page becomes inert after closing, try modal={false}
          // modal={false}
        />
      )}

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
              {viewLabel}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => {
              // Let the menu close fully before mounting the dialog (prevents instant-close)
              setTimeout(() => setOpen(true), 0);
            }}
          >
            <QrCode className="h-4 w-4" />
            Show QR
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
