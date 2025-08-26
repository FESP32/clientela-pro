"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QR } from "@/components/ui/qr";

export function IntentLinkDialog({
  open,
  onOpenChange,
  href, // e.g. `/services/referrals/referred/${id}`
  title = "Scan to open",
  modal = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  href: string;
  title?: string;
  modal?: boolean;
}) {
  // Make an absolute URL for copy/open; QR can take relative (QR component resolves it)
  const url = useMemo(() => {
    if (typeof window === "undefined") return href;
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}${href}`;
  }, [href]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="break-all">{url}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="rounded-lg border p-4 bg-background">
            <QR value={href} size={220} />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="intent-url" className="text-sm text-muted-foreground">
            URL
          </label>
          <div className="flex gap-2">
            <Input id="intent-url" readOnly value={url} />
            <Button
              type="button"
              onClick={() => navigator.clipboard?.writeText?.(url)}
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button asChild variant="secondary">
            <Link href={url} target="_blank" rel="noopener noreferrer">
              Open
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
