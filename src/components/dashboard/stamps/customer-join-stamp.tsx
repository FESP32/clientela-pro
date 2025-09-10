"use client";

import { motion, type Variants } from "framer-motion";
import {
  Stamp,
  Sparkles,
  Clock3,
  ShieldCheck,
  QrCode,
  Gift,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

const parentStagger: Variants = {
  hidden: {},
  show: { transition: { when: "beforeChildren", staggerChildren: 0.06 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-w-[140px]">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}

export default function CustomerJoinStamp({
  cardId,
  action,
}: {
  cardId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={parentStagger}
      className="space-y-6"
      aria-labelledby="join-stamp-create"
    >
      {/* Friendly icon header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-center gap-3"
      >
        <motion.span
          initial={{ rotate: -8, y: 0 }}
          animate={{ rotate: [-8, 6, -4, 0], y: [0, -2, 0, 0] }}
          transition={{ duration: 1.2, repeat: 0 }}
          aria-hidden
        >
          <Stamp className="h-7 w-7 text-primary" />
        </motion.span>
        <h2 id="join-stamp-create" className="text-xl font-semibold">
          Add this card to my account
        </h2>
        <motion.span
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          aria-hidden
        >
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </motion.span>
      </motion.div>

      {/* Quick benefits */}
      <motion.ul
        variants={fadeUp}
        className="mx-auto grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-3 text-sm"
      >
        <li className="flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
          Track punches instantly
        </li>
        <li className="flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-200">
          <QrCode className="h-4 w-4 text-indigo-600" aria-hidden />
          Fast QR access
        </li>
        <li className="flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-200">
          <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden />
          Private to you
        </li>
      </motion.ul>

      {/* Soft welcome line */}
      <motion.p
        variants={fadeUp}
        className="mx-auto max-w-xl text-sm text-muted-foreground"
        id="join-help"
      >
        Create your personal stamp card and start collecting right away. It
        takes a few seconds—rewards are closer than you think.
      </motion.p>

      {/* Form */}
      <motion.form
        variants={fadeUp}
        action={action}
        className="mx-auto max-w-xl space-y-4"
        aria-describedby="join-help"
      >
        <input type="hidden" name="card_id" value={cardId} />

        {/* Tiny reassurance row */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" aria-hidden /> under 5 seconds
          </span>
          <span className="inline-flex items-center gap-1">
            <Gift className="h-4 w-4" aria-hidden /> unlock perks sooner
          </span>
        </div>

        <div className="flex justify-center">
          <SubmitButton>Create my card</SubmitButton>
        </div>
      </motion.form>
    </motion.div>
  );
}
