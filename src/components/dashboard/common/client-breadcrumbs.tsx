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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
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

function truncateLabel(label: string, maxLength: number = 14) {
  if (!label) return "";
  return label.length > maxLength ? label.slice(0, maxLength) + "..." : label;
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

  // items = ["", ...segments]; where "" represents the root
  const items = [""].concat(segments);

  // Build trail metadata
  const trail = items.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx).join("/");
    const isRoot = idx === 0;
    const isLast = idx === items.length - 1;
    const label = isRoot ? rootLabel : labels[seg] ?? humanize(seg);
    return { seg, href: isRoot ? "/" : href, isRoot, isLast, label };
  });

  const current = trail[trail.length - 1];
  const prev = trail.length > 1 ? trail[trail.length - 2] : undefined;

  return (
    <div className={className}>
      {/* Mobile: back + current + overflow menu */}
      <div className="flex items-center gap-1 sm:hidden">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Go back"
          className="shrink-0"
        >
          <Link href={prev?.href ?? "/"}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>

        {/* overflow for full path (excluding the current) */}
        {trail.length > 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open full path"
                className="shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {trail.slice(0, -1).map((t) => (
                <DropdownMenuItem key={t.href} asChild>
                  <Link href={t.href}>{t.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="truncate text-sm text-muted-foreground">
          {truncateLabel(current?.label) ?? truncateLabel(rootLabel)}
        </div>
      </div>

      {/* Desktop: full breadcrumbs */}
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          {trail.map((t, i) => (
            <React.Fragment key={`${t.href}-${i}`}>
              <BreadcrumbItem>
                {t.isLast ? (
                  <BreadcrumbPage>{t.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={t.href}>{t.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!t.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
