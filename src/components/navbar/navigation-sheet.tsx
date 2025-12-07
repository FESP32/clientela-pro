"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Tag, CircleQuestionMark, HandCoins } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

interface NavigationSheetProps {
  navItems?: NavItem[];
  primaryButtonLabel?: string;
  secondaryButtonLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const defaultNavItems: NavItem[] = [
  {
    label: "Features",
    href: "#features",
    icon: <HandCoins className="h-4 w-4" />,
  },
  {
    label: "pricing",
    href: "#pricing",
    icon: <Tag className="h-4 w-4" />,
  },
  {
    label: "faq",
    href: "#faq",
    icon: <CircleQuestionMark className="h-4 w-4" />,
  },
];

export function NavigationSheet({
  navItems = defaultNavItems,
}: NavigationSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col p-4">
        <SheetHeader className="mb-4 items-start">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-xl font-medium",
                  "text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                )}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
