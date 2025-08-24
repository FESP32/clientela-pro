"use client";

import Link from "next/link";
import ThemeToggle from "@/components/dashboard/common/theme-toggle";
import { ListChecks, Stamp, Gift, Share2, User, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/i18n/locale-switcher";
import { Logo } from "@/components/navbar/logo";

type Tile = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  desc?: string;
};

const TILES: Tile[] = [
  {
    href: "/services/surveys",
    label: "services.serviceTitle1",
    Icon: ListChecks,
    desc: "services.serviceDescription1",
  },
  {
    href: "/services/stamps",
    label: "services.serviceTitle2",
    Icon: Stamp,
    desc: "services.serviceDescription2",
  },
  {
    href: "/services/gifts",
    label: "services.serviceTitle3",
    Icon: Gift,
    desc: "services.serviceDescription3",
  },
  {
    href: "/services/referrals",
    label: "services.serviceTitle4",
    Icon: Share2,
    desc: "services.serviceDescription4",
  },
  {
    href: "/profile",
    label: "services.serviceTitle5",
    Icon: User,
    desc: "services.serviceDescription5",
  },
];

export default function CustomerMenu() {
  const t = useTranslations("ServicePage");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/40 via-black/35 to-black/40 backdrop-blur-3xl p-4">
      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white/90 shadow-2xl ring-1 ring-black/5 dark:bg-neutral-900/90">
        {/* Brand bar with logo + theme toggle */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <Logo hideText/>
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("welcome")}
            </div>
          </div>
          <div className="flex space-x-2 items-center">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pt-3 pb-2 text-center">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t("header.title")}
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {t("header.subtitle")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 p-6 pt-4 sm:grid-cols-3">
          {TILES.map(({ href, label, Icon, desc }, idx) => (
            <Link
              key={href}
              href={href}
              className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 p-3 text-center transition
                         hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                         dark:border-neutral-700/60 dark:bg-neutral-900/70"
              aria-label={label}
            >
              <div
                className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-neutral-200/80 transition
                              group-hover:from-primary/20 group-hover:to-primary/10 group-hover:ring-primary/30
                              dark:ring-neutral-700/60"
              >
                <Icon className="h-7 w-7 text-primary transition group-hover:scale-105" />
              </div>
              <span className="text-sm font-medium text-neutral-900 group-hover:text-primary dark:text-neutral-100">
                {t(label)}
              </span>
              {desc ? (
                <span className="mt-0.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                  {t(desc)}
                </span>
              ) : null}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="px-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700" />
        </div>

        {/* Footer: Back to Home + Support */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
