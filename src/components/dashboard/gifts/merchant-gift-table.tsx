// components/dashboard/gifts/gifts-table.tsx
"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { deleteGift } from "@/actions";
import type { GiftRow } from "@/types";

/* -------------------------------------------
 * Mobile-only, thumb-friendly "Give gift" button
 * ------------------------------------------- */
function MobileGiveButton({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant="secondary"
      aria-label="Give gift"
      className={`md:hidden h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
        className ?? ""
      }`}
    >
      <Link href={`/dashboard/gifts/${id}`}>
        <UserPlus className="h-5 w-5 mr-2" />
        Give gift
      </Link>
    </Button>
  );
}

/* -------------------------------------------
 * Reusable actions menu (desktop + mobile)
 * ------------------------------------------- */
function GiftActionsMenu({
  id,
  align = "end",
  buttonClassName,
}: {
  id: string;
  align?: "start" | "end";
  buttonClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={buttonClassName}
          aria-label="Open actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* Give gift (primary) */}
        <DropdownMenuItem
          asChild
          className="text-primary data-[highlighted]:bg-primary/10"
        >
          <Link
            href={`/dashboard/gifts/${id}`}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Give gift
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Delete (destructive) */}
        <form action={deleteGift}>
          <input type="hidden" name="id" value={id} />
          <DropdownMenuItem
            asChild
            className="text-red-600 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-950/30"
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MerchantGiftsTable({ gifts }: { gifts: GiftRow[] }) {
  const columns: Column<GiftRow>[] = [
    {
      key: "title",
      header: "Title",
      headClassName: "min-w-[30%]",
      cell: (g) => <span className="font-medium">{g.title}</span>,
    },
    {
      key: "description",
      header: "Description",
      headClassName: "min-w-[50%]",
      cell: (g) => (
        <span className="text-muted-foreground">{g.description}</span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "min-w-[20%] text-right",
      cell: (g) => (
        <div className="text-right">
          <GiftActionsMenu id={g.id} />
        </div>
      ),
    },
  ];

  const emptyState = (
    <div className="rounded-lg border p-6 text-sm text-muted-foreground">
      No gifts yet.
    </div>
  );

  return (
    <ResponsiveListTable<GiftRow>
      items={gifts}
      getRowKey={(g) => g.id}
      emptyState={emptyState}
      /* Mobile cards */
      renderMobileCard={(g) => (
        <div key={g.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{g.title}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {g.description}
              </p>
            </div>

            {/* Actions (mobile: big Give button + kebab) */}
            <div className="shrink-0 flex flex-col items-end gap-2">
              <MobileGiveButton id={g.id} />
              <GiftActionsMenu
                id={g.id}
                align="end"
                buttonClassName="shrink-0"
              />
            </div>
          </div>
        </div>
      )}
      /* Desktop table */
      columns={columns}
    />
  );
}
