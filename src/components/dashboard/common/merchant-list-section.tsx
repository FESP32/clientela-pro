// components/dashboard/common/merchant-list-section.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type ListSectionProps = React.PropsWithChildren<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  id?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  /** If true, use full width; otherwise cap at a large container */
  fluid?: boolean;
}>;

export default function MerchantListSection({
  title,
  subtitle,
  children,
  id,
  className,
  headerClassName,
  contentClassName,
  fluid = true, // <- make fluid the default
}: ListSectionProps) {
  // Fluid: full width with horizontal padding.
  // Non-fluid: wide container (7xl) centered.
  const widthClasses = fluid
    ? "w-full px-5 sm:px-6 lg:px-16 mt-6"
    : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

  return (
    <section id={id} className={cn(widthClasses, className)}>
      {(title || subtitle) && (
        <div
          className={cn(
            "mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between",
            headerClassName
          )}
        >
          <div>
            {title && (
              <h2 className="text-2xl font-semibold leading-none tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <div className="mt-1 text-sm text-muted-foreground">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={cn("space-y-3", contentClassName)}>{children}</div>
    </section>
  );
}
