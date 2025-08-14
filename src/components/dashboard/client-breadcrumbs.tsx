"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

type Props = {
  rootLabel?: string;
  labels?: Record<string, string>;
  className?: string;
};

function humanize(segment: string) {
  const s = decodeURIComponent(segment.replace(/-/g, " "));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ClientBreadcrumbs({
  rootLabel = "Home",
  labels = {},
  className,
}: Props) {
  const pathname = usePathname() || "/";
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((seg) => !(seg.startsWith("(") && seg.endsWith(")")));

  const items = ["" /* root */].concat(segments);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx).join("/");
          const isRoot = idx === 0;
          const isLast = idx === items.length - 1;
          const label = isRoot ? rootLabel : labels[seg] ?? humanize(seg);

          return (
            <React.Fragment key={`${href || "root"}-${idx}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href || "/"}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
