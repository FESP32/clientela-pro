"use client";

import Link from "next/link";
import { ListChecks, Stamp, Gift, Share2, User } from "lucide-react";

type Tile = {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const TILES: Tile[] = [
  { href: "/services/surveys", label: "Surveys", Icon: ListChecks },
  { href: "/services/stamps", label: "Stamps", Icon: Stamp },
  { href: "/services/gifts", label: "Gifts", Icon: Gift },
  { href: "/services/referrals", label: "Referrals", Icon: Share2 },
  { href: "/profile", label: "Profile", Icon: User },
];

export default function CustomerMenu() {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 shadow-xl ring-1 ring-black/5">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 text-center">
          <div className="mx-auto mb-2 h-1 w-16 rounded-full bg-neutral-200/70 dark:bg-neutral-700/60" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            What would you like to do?
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 p-6 pt-4 sm:grid-cols-3">
          {TILES.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex aspect-square flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/80 p-3 text-center transition
                         hover:border-blue-500/50 hover:shadow-md dark:border-neutral-700/60 dark:bg-neutral-900/70"
              aria-label={label}
            >
              <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-neutral-200/80 transition group-hover:ring-blue-500/40 dark:ring-neutral-700/60">
                <Icon className="h-6 w-6 text-neutral-700 transition group-hover:text-blue-600 dark:text-neutral-200" />
              </div>
              <span className="text-sm font-medium text-neutral-800 group-hover:text-blue-700 dark:text-neutral-200 dark:group-hover:text-blue-400">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
