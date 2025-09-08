// components/dashboard/common/premium-background.tsx
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export default function Background({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-10 overflow-hidden",
        className
      )}
    >
      {/* --- Aurora glows --- */}
      <div
        className={cn(
          "absolute -top-32 -left-32 h-[36rem] w-[36rem] blur-3xl",
          "rounded-full",
          // Indigo → sky
          "bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.20),transparent_10%)]",
          "dark:bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.18),transparent_10%)]"
        )}
      />
      <div
        className={cn(
          "absolute top-1/2 right-0 h-[28rem] w-[28rem] translate-x-1/3 -translate-y-1/2 blur-3xl",
          "rounded-full",
          // Fuchsia → rose
          "bg-[radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.18),transparent_60%)]",
          "dark:bg-[radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.16),transparent_60%)]"
        )}
      />
      <div
        className={cn(
          "absolute bottom-[-10%] left-1/2 h-[26rem] w-[36rem] -translate-x-1/2 blur-3xl",
          "rounded-full",
          // Emerald → cyan
          "bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.14),transparent_60%)]",
          "dark:bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.12),transparent_60%)]"
        )}
      />

      {/* --- Subtle grid (fades toward edges) --- */}
      <div
        className={cn(
          "absolute inset-0 opacity-10",
          // Light mode grid
          "[background-image:linear-gradient(to_right,rgba(120,119,198,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,119,198,0.08)_1px,transparent_1px)]",
          // Dark mode grid
          "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]",
          "bg-[size:40px_40px]",
          // Fade grid toward edges so it never fights content
          "[mask-image:radial-gradient(100%_100%_at_50%_20%,black,transparent)]"
        )}
      />

      {/* --- Gentle top highlight / glass feel --- */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/20 to-transparent dark:from-white/10" />

      {/* Bottom vignette for depth */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/20 to-transparent" />
    </div>
  );
}
