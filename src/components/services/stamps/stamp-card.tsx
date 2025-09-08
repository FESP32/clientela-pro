// components/stamps/punch-card.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/dashboard/stamps/progress-bar";
import StampDots from "@/components/dashboard/stamps/stamp-dots";
import { fmt } from "@/lib/utils";
import { ArrowLeft, CalendarClock, Stamp as StampIcon } from "lucide-react";
import type { StampCardRow } from "@/types";

type Membership = {
  qty?: number | null;
  completed_at?: string | null;
};

function isActive(card: StampCardRow) {
  const now = new Date();
  const startsOk = !card.valid_from || new Date(card.valid_from) <= now;
  const endsOk = !card.valid_to || now <= new Date(card.valid_to);
  return card.is_active && startsOk && endsOk;
}

export default function StampCard({
  card,
  membership,
}: {
  card: StampCardRow;
  membership: Membership;
}) {
  const punches = membership.qty ?? 0;
  const total = Math.max(1, card.stamps_required ?? 1);
  const remaining = Math.max(0, total - punches);
  const pct = (punches / total) * 100;
  const active = isActive(card);

  return (
    <section
      aria-label={`${card.title} stamp card`}
      className={[
        "relative mx-auto max-w-3xl my-12 px-5 py-6 sm:px-8 sm:py-8",
        // Foil border wrapper
        "rounded-[22px] p-[1px]",
        "bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(255,255,255,0.35)_35%,rgba(0,0,0,0.05)_60%,rgba(255,255,255,0.5))]",
        "dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04)_35%,rgba(255,255,255,0.02)_60%,rgba(255,255,255,0.08))]",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)]",
      ].join(" ")}
    >
      {/* Inner paper surface */}
      <div
        className={[
          "relative rounded-[20px]",
          "bg-background/80 supports-[backdrop-filter]:bg-background/60 supports-[backdrop-filter]:backdrop-blur",
          "border border-border/60",
        ].join(" ")}
      >
        {/* Accent strip */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[20px] bg-gradient-to-r from-primary/20 via-primary/70 to-primary/20" />

        {/* Ticket side notches */}
        <span className="pointer-events-none absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-border/60 bg-background" />
        <span className="pointer-events-none absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-border/60 bg-background" />

        {/* Paper grain (very subtle) */}
        <div className="pointer-events-none absolute inset-0 rounded-[20px] [background:radial-gradient(1200px_600px_at_-10%_-20%,rgba(0,0,0,0.03),transparent_40%),radial-gradient(800px_400px_at_120%_120%,rgba(0,0,0,0.03),transparent_40%)]" />

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          {/* Header: centered, icon-forward */}
          <header className="mb-6 flex flex-col items-center gap-3 text-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background/70">
              <StampIcon className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {card.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {active ? (
                <Badge className="px-2.5">Active</Badge>
              ) : (
                <Badge variant="outline" className="px-2.5">
                  Inactive
                </Badge>
              )}
              <Badge variant="secondary" className="tabular-nums px-2.5">
                {total} stamps
              </Badge>
            </div>
          </header>

          {/* Reward */}
          <div className="mx-auto max-w-prose text-center">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Reward
            </p>
            <p className="mt-1 text-sm leading-relaxed">{card.goal_text}</p>

            {(card.valid_from || card.valid_to) && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                <span className="tabular-nums">
                  Valid: {fmt(card.valid_from)} — {fmt(card.valid_to)}
                </span>
              </div>
            )}
          </div>

          {/* Perforation divider */}
          <div className="my-6 h-px w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,rgba(0,0,0,0.18)_8px,rgba(0,0,0,0.18)_9px,transparent_9px)] dark:bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,rgba(255,255,255,0.18)_8px,rgba(255,255,255,0.18)_9px,transparent_9px)] opacity-60" />

          {/* Progress (centered) */}
          <section
            aria-labelledby="progress-heading"
            className="mx-auto max-w-xl space-y-4"
          >
            <div className="flex items-center justify-between text-sm">
              <h2 id="progress-heading" className="font-medium">
                Progress
              </h2>
              <span className="tabular-nums text-muted-foreground">
                {punches}/{total} ({Math.round(pct)}%)
              </span>
            </div>

            <div className="mx-auto max-w-xl">
              <ProgressBar pct={pct} />
            </div>

            {/* CENTER the stamps */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <StampDots total={total} filled={punches} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <Badge variant="secondary" className="tabular-nums">
                Remaining: {remaining}
              </Badge>
              {membership.completed_at ? (
                <Badge className="flex items-center gap-1">
                  Goal reached 🎉
                </Badge>
              ) : null}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-8 flex justify-center">
            <Button asChild variant="outline" className="group">
              <Link href="/services/stamps" aria-label="Back to Stamps">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Stamps
              </Link>
            </Button>
          </footer>
        </div>
      </div>
    </section>
  );
}
