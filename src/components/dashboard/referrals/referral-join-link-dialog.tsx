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

export function ReferralJoinLinkDialog({
  open,
  onOpenChange,
  programTitle,
  joinPath, // e.g. `/services/referrals/referrer/${id}`
  modal = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programTitle: string;
  joinPath: string;
  modal?: boolean;
}) {
  const url = useMemo(() => {
    if (typeof window === "undefined") return joinPath;
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}${joinPath}`;
  }, [joinPath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join link</DialogTitle>
          <DialogDescription>
            Program: <span className="font-medium">{programTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* QR */}
        <div className="flex items-center justify-center py-4">
          <div className="rounded-lg border p-4 bg-background">
            <QR value={joinPath} size={220} />
          </div>
        </div>

        {/* URL + actions */}
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
