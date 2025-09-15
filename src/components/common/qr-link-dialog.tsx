"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QR } from "@/components/ui/qr";
import { QrCode, Link2, Copy, Check, ExternalLink } from "lucide-react";

export default function QRLinkDialog({
  open,
  onOpenChange,
  title,
  path,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title: string;
  path: string;
}) {
  const url = useMemo(() => {
    if (typeof window === "undefined") return path;
    const base = window.location.origin.replace(/\/$/, "");
    return `${base}${path}`;
  }, [path]);

  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard?.writeText?.(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 6 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 22 },
    },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="space-y-5"
        >
          <DialogHeader>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="space-y-1.5"
            >
              <DialogTitle className="flex items-center gap-2 text-xl">
                <QrCode className="h-5 w-5" />
                Scan the QR Code
              </DialogTitle>
              <DialogDescription>
                <span className="font-medium">{title}</span>
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          {/* QR code */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl p-[2px] bg-gradient-to-br from-primary/30 via-primary/15 to-transparent"
            >
              <div className="rounded-2xl border bg-background p-4 shadow-sm">
                <motion.div
                  initial={{ opacity: 0, rotate: -2 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 14,
                    delay: 0.05,
                  }}
                  className="rounded-lg"
                >
                  {/* Use full URL for better scan reliability */}
                  <QR value={url} size={220} />
                </motion.div>
              </div>

              {/* soft animated glow */}
              <motion.span
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-primary/10"
              />
            </motion.div>
          </motion.div>

          {/* Direct URL */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <label
              htmlFor="respond-url"
              className="text-sm text-muted-foreground flex items-center gap-2"
            >
              <Link2 className="h-4 w-4" />
              URL
            </label>
            <div className="flex gap-2 items-center">
              <div className="relative grow">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input id="respond-url" readOnly value={url} className="pl-9" />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={copyUrl}
                      variant={copied ? "secondary" : "default"}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {copied ? (
                          <motion.span
                            key="copied"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="inline-flex items-center gap-1"
                          >
                            <Check className="h-4 w-4" />
                            Copied
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="inline-flex items-center gap-1"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Copy link to clipboard
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div aria-live="polite" className="sr-only">
                {copied ? "URL copied to clipboard" : ""}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="pt-1"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="secondary">
                    <Link
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Open in a new tab</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
