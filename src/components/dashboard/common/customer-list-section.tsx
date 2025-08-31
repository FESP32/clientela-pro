// components/customer/common/customer-list-section.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type WidthKey =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl";

const MAX_MAP: Record<WidthKey, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

type CustomerListSectionProps = React.PropsWithChildren<{
  id?: string;
  /** Main title — rendered large and centered */
  title?: React.ReactNode;
  /** Supporting copy — centered, softened color, constrained width */
  subtitle?: React.ReactNode;
  /** Eyebrow/kicker above the title (e.g., “Just for you”) */
  kicker?: React.ReactNode;
  /** Row of CTA buttons/links shown under the subtitle */
  actions?: React.ReactNode;

  /** Outer container classes */
  className?: string;
  /** Header container classes */
  headerClassName?: string;
  /** Content container classes */
  contentClassName?: string;

  /**
   * If true, edge-to-edge with padding; otherwise centered wide container.
   * For customer pages, we default to non-fluid (centered).
   */
  fluid?: boolean;

  /** Max width for header block (kicker/title/subtitle/actions). Default: 3xl */
  headerMax?: WidthKey;

  /** Max width for content block (children). Default: 4xl */
  contentMax?: WidthKey;

  /** When true, shows a subtle hairline divider below header */
  divider?: boolean;
}>;

export default function CustomerListSection({
  id,
  title,
  subtitle,
  kicker,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
  fluid = false, // <-- centered by default for customer UX
  headerMax = "3xl",
  contentMax = "4xl",
  divider = false,
}: CustomerListSectionProps) {
  // Outer width behavior
  const rootWidth = fluid
    ? "w-full px-5 sm:px-6 lg:px-16 mt-6"
    : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

  // Constrained, centered header/content blocks
  const headerWidth = MAX_MAP[headerMax] ?? "max-w-3xl";
  const contentWidth = MAX_MAP[contentMax] ?? "max-w-4xl";

  return (
    <section id={id} className={cn(rootWidth, className)}>
      {(title || subtitle || kicker || actions) && (
        <div
          className={cn(
            "mx-auto text-center mt-12",
            headerWidth,
            "mb-6 sm:mb-8",
            headerClassName
          )}
        >
          {kicker ? (
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {kicker}
            </div>
          ) : null}

          {title ? (
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {title}
            </h1>
          ) : null}

          {subtitle ? (
            <p className="mx-auto mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          ) : null}

          {actions ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {actions}
            </div>
          ) : null}

          {divider && (
            <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          )}
        </div>
      )}

      <div
        className={cn("mx-auto", contentWidth, "space-y-3", contentClassName)}
      >
        {children}
      </div>
    </section>
  );
}
