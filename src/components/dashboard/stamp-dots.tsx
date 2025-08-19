"use client";

import { motion } from "framer-motion";
import { Stamp, Circle } from "lucide-react";

type StampDotsProps = {
  total: number;
  filled: number;
  /** Optional: override icons */
  FilledIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  EmptyIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Optional: prefer a specific max column count (default 8) */
  maxCols?: number;
};

export default function StampDots({
  total,
  filled,
  FilledIcon = Stamp,
  EmptyIcon = Circle,
  maxCols = 8,
}: StampDotsProps) {
  const items = Array.from({ length: total });

  // Compute a tidy column count based on total, capped by maxCols
  const cols = Math.min(
    maxCols,
    Math.max(4, Math.ceil(Math.sqrt(total))) // between 4 and maxCols
  );

  // Framer Motion variants for staggered entrance
  const container = {
    hidden: { opacity: 0, y: 4 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.04, when: "beforeChildren" },
    },
  };

  const item = {
    hidden: { scale: 0.9, opacity: 0 },
    show: { scale: 1, opacity: 1, transition: { duration: 0.16 } },
  };

  return (
    <motion.div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      variants={container}
      initial="hidden"
      animate="show"
      role="list"
      aria-label="Stamp progress"
    >
      {items.map((_, i) => {
        const active = i < filled;
        const Icon = active ? FilledIcon : EmptyIcon;

        return (
          <motion.button
            key={i}
            variants={item}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className={[
              // bigger, touch-friendly targets
              "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12",
              "rounded-full border inline-flex items-center justify-center",
              "transition-colors duration-150",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border",
              // optional subtle ring on hover
              "hover:ring-2 hover:ring-ring/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            ].join(" ")}
            title={active ? `Stamped ${i + 1}` : `Empty ${i + 1}`}
            aria-label={active ? `Stamped ${i + 1}` : `Empty ${i + 1}`}
            role="listitem"
            type="button"
            disabled
          >
            {/* Default filled icon is Stamp; swap to CheckCircle2 for a different vibe */}
            <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
          </motion.button>
        );
      })}
    </motion.div>
  );
}
