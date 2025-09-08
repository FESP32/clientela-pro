"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";

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

const parentStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, when: "beforeChildren" },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, scale: 0.995 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function MerchantListSection({
  title,
  subtitle,
  children,
  id,
  className,
  headerClassName,
  contentClassName,
  fluid = true,
}: ListSectionProps) {
  const widthClasses = fluid
    ? "w-full px-5 sm:px-6 lg:px-16 mt-8"
    : "mx-auto max-w-7xl px-5 sm:px-6 lg:px-8";

  const kids = React.Children.toArray(children);

  return (
    <motion.section
      id={id}
      className={cn(widthClasses, className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {(title || subtitle) && (
        <motion.div
          className={cn(
            "mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between",
            headerClassName
          )}
          variants={parentStagger}
        >
          <motion.div variants={fadeUp}>
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
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className={cn("space-y-3", contentClassName)}
        variants={parentStagger}
      >
        {kids.map((child, i) => (
          <motion.div className="space-y-2" key={i} variants={fadeUp}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
