// components/common/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlarmClockOff, CheckCircle2, Flag, PauseCircle } from "lucide-react";

type Props = {
  /** "active" | "inactive" | "finished" (free-form string; normalized at runtime) */
  status: string;
  /** ISO date string (optional). If passed and in the past, shows "Expired" unless status is "finished". */
  endsAt?: string | null;
  /** Optional test override: ISO date string used as "now". */
  now?: string;
  /** Show an icon (default true). */
  withIcon?: boolean;
  className?: string;
};

export default function StatusBadge({
  status,
  endsAt,
  now,
  withIcon = true,
  className,
}: Props) {
  const s = String(status ?? "")
    .trim()
    .toLowerCase();
  // Normalize to known base statuses; default to "inactive" if unknown
  const base =
    s === "active" || s === "inactive" || s === "finished" ? s : "inactive";

  const end = endsAt ? new Date(endsAt) : null;
  const nowDate = now ? new Date(now) : new Date();
  const endValid = !!end && !Number.isNaN(end.getTime());

  const isExpired =
    base !== "finished" && endValid && nowDate.getTime() > end!.getTime();

  const derived = isExpired ? "expired" : base;

  // Meta map kept untyped to avoid unions; values match shadcn/ui Badge variants.
  const META: Record<
    string,
    {
      label: string;
      variant: string;
      Icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    active: { label: "Active", variant: "default", Icon: CheckCircle2 },
    inactive: { label: "Inactive", variant: "secondary", Icon: PauseCircle },
    finished: { label: "Finished", variant: "secondary", Icon: Flag },
    expired: { label: "Expired", variant: "destructive", Icon: AlarmClockOff },
  };

  const meta = META[derived] ?? META["inactive"];
  const { label, variant, Icon } = meta;

  return (
    <Badge
      // @ts-expect-error: variant is a string; values are valid for the Badge component
      variant={variant}
      className={cn("gap-1.5 whitespace-nowrap", className)}
      aria-label={label}
      title={label}
    >
      {withIcon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {label}
    </Badge>
  );
}
