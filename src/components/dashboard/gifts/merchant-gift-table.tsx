// components/dashboard/gifts/gifts-table.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
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
} from "@/components/dashboard/common/responsive-list-table";
import { deleteGift } from "@/actions";

type GiftListItem = {
  id: string;
  title: string;
  image_url: string | null;
};

function GiftActions({ id }: { id: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Open actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/gifts/${id}`}
            className="flex items-center gap-2"
          >
            <UserPlus className="size-4" />
            Give gift
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={deleteGift}>
          <input type="hidden" name="id" value={id} />
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2 text-red-600 focus:text-red-600"
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

export default function MerchantGiftsTable({ gifts }: { gifts: GiftListItem[] }) {
  const columns: Column<GiftListItem>[] = [
    {
      key: "title",
      header: "Title",
      headClassName: "min-w-[220px]",
      cell: (g) => <span className="font-medium">{g.title}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "min-w-[80px] text-right",
      cell: (g) => (
        <div className="text-right">
          <GiftActions id={g.id} />
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
    <ResponsiveListTable<GiftListItem>
      items={gifts}
      getRowKey={(g) => g.id}
      emptyState={emptyState}
      /* Mobile cards */
      renderMobileCard={(g) => (
        <div
          key={g.id}
          className="flex items-center gap-3 rounded-md border p-3"
        >
          {g.image_url ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-md border shrink-0">
              <Image
                src={g.image_url}
                alt={g.title}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-md border text-xs text-muted-foreground shrink-0">
              —
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{g.title}</p>
          </div>

          <GiftActions id={g.id} />
        </div>
      )}
      /* Desktop table */
      columns={columns}
    />
  );
}
