"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QR } from "@/components/ui/qr";

export function ReferralIntentLinkDialog({
  open,
  onOpenChange,
  intentTitle,
  intentPath, // e.g. `/services/referrals/referred/${intentId}`
  modal = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intentTitle: string;
  intentPath: string;
  modal?: boolean;
}) {
  const url = useMemo(() => {
    if (typeof window === "undefined") return intentPath;
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}${intentPath}`;
  }, [intentPath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite link</DialogTitle>
          <DialogDescription>
            Intent: <span className="font-mono">{intentTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-4">
          <div className="rounded-lg border p-4 bg-background">
            <QR value={intentPath} size={220} />
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
