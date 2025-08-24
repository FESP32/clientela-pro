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

export function RespondLinkDialog({
  open,
  onOpenChange,
  surveyTitle,
  respondPath, // e.g. `/services/surveys/${id}/respond`
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  surveyTitle: string;
  respondPath: string;
}) {
  const url = useMemo(() => {
    if (typeof window === "undefined") return respondPath;
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}${respondPath}`;
  }, [respondPath]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Respond link</DialogTitle>
          <DialogDescription>
            Survey: <span className="font-medium">{surveyTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* QR code */}
        <div className="flex items-center justify-center py-4">
          <div className="rounded-lg border p-4 bg-background">
            <QR value={respondPath} size={220} />
          </div>
        </div>

        {/* Direct URL */}
        <div className="space-y-2">
          <label
            htmlFor="respond-url"
            className="text-sm text-muted-foreground"
          >
            URL
          </label>
          <div className="flex gap-2">
            <Input id="respond-url" readOnly value={url} />
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
