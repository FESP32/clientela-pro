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

export function StampJoinLinkDialog({
  open,
  onOpenChange,
  cardTitle,
  joinPath, // e.g. `/services/stamps/${id}/join`
  modal = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardTitle: string;
  joinPath: string;
  modal?: boolean;
}) {
  // Absolute URL for copy/open; QR component can resolve relative
  const url = useMemo(() => {
    if (typeof window === "undefined") return joinPath;
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}${joinPath}`;
  }, [joinPath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stamp card join link</DialogTitle>
          <DialogDescription>
            Card: <span className="font-medium">{cardTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-4">
          <div className="rounded-lg border p-4 bg-background">
            <QR value={joinPath} size={220} />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="join-url" className="text-sm text-muted-foreground">
            URL
          </label>
          <div className="flex gap-2">
            <Input id="join-url" readOnly value={url} />
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
