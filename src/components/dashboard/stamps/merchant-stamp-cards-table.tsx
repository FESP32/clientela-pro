// components/dashboard/stamps/stamp-cards-table.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  ExternalLink,
  QrCode,
  Stamp as StampIcon,
  ToggleLeft,
  ToggleRight,
  ListCheck,
} from "lucide-react";

import { StampJoinLinkDialog } from "@/components/dashboard/stamps/stamp-join-link-dialog";
import { fmt } from "@/lib/utils";
import type { StampCardListItem } from "@/types";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "@/components/common/status-badge";
import { finishStampCard, toggleStampCardActive } from "@/actions";

/* -------------------------------------------
 * Reusable actions menu (desktop + mobile)
 * ------------------------------------------- */
type StampCardActionsMenuProps = {
  card: StampCardListItem;
  deleteStampCard: (formData: FormData) => Promise<void>;
  onShowLink: (title: string, path: string) => void;
  align?: "start" | "end";
  buttonClassName?: string;
};

function StampCardActionsMenu({
  card,
  deleteStampCard,
  onShowLink,
  align = "end",
  buttonClassName,
}: StampCardActionsMenuProps) {
  const joinPath = `/services/stamps/${card.id}/join`;
  const isActive = card.status === "active";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${card.title}`}
          className={buttonClassName}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* Open join page (primary) */}
        <DropdownMenuItem
          asChild
          className="text-primary data-[highlighted]:bg-primary/10"
        >
          <Link href={joinPath} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Open join page
          </Link>
        </DropdownMenuItem>

        {/* Show join URL (amber) */}
        <DropdownMenuItem
          className="flex items-center gap-2 text-amber-600 data-[highlighted]:bg-amber-50 dark:data-[highlighted]:bg-amber-950/30"
          onSelect={() => setTimeout(() => onShowLink(card.title, joinPath), 0)}
        >
          <QrCode className="h-4 w-4" />
          Show join URL
        </DropdownMenuItem>

        {/* Create Stamp Punch (indigo) */}
        <DropdownMenuItem
          asChild
          className="text-indigo-600 data-[highlighted]:bg-indigo-50 dark:data-[highlighted]:bg-indigo-950/30"
        >
          <Link
            href={`/dashboard/stamps/${card.id}`}
            className="flex items-center gap-2"
          >
            <StampIcon className="size-4" />
            Create Stamp Punch
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Finish (violet) */}
        <form action={finishStampCard.bind(null, card.id)}>
          <DropdownMenuItem
            asChild
            className="text-violet-600 data-[highlighted]:bg-violet-50 dark:data-[highlighted]:bg-violet-950/30"
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              <ListCheck className="h-4 w-4" />
              Finish
            </button>
          </DropdownMenuItem>
        </form>

        {/* Toggle Active/Inactive (green when activating, zinc when deactivating) */}
        <form action={toggleStampCardActive.bind(null, card.id)}>
          <DropdownMenuItem
            asChild
            className={
              isActive
                ? "text-zinc-700 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-900"
                : "text-green-600 data-[highlighted]:bg-green-50 dark:data-[highlighted]:bg-green-950/30"
            }
          >
            <button
              type="submit"
              className="w-full text-left flex items-center gap-2"
            >
              {isActive ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}
              {isActive ? "Set inactive" : "Set active"}
            </button>
          </DropdownMenuItem>
        </form>

        {/* Delete (destructive) */}
        <form action={deleteStampCard}>
          <input type="hidden" name="cardId" value={card.id} />
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

/* -------------------------------------------
 * Mobile quick-action buttons (Join + Punch)
 * ------------------------------------------- */
function MobileJoinButton({
  cardId,
  className,
}: {
  cardId: string;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant="secondary"
      aria-label="Join stamp card"
      className={`md:hidden w-full h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
        className ?? ""
      }`}
    >
      <Link href={`/services/stamps/${cardId}/join`}>
        <ExternalLink className="h-5 w-5 mr-2" />
        Join
      </Link>
    </Button>
  );
}

function MobilePunchButton({
  cardId,
  className,
}: {
  cardId: string;
  className?: string;
}) {
  return (
    <Button
      asChild
      variant="default"
      aria-label="Create stamp punch"
      className={`md:hidden w-full h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
        className ?? ""
      }`}
    >
      <Link href={`/dashboard/stamps/${cardId}`}>
        <StampIcon className="h-5 w-5 mr-2" />
        Punch
      </Link>
    </Button>
  );
}

/* -------------------------------------------
 * Main table
 * ------------------------------------------- */
export default function MerchantStampCardsTable({
  cards,
  deleteStampCard,
}: {
  cards: StampCardListItem[];
  deleteStampCard(formData: FormData): Promise<void>;
}) {
  const [dlg, setDlg] = useState<{ title: string; path: string } | null>(null);

  const emptyState = (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">
          No stamp cards yet.
        </p>
      </CardContent>
    </Card>
  );

  const columns: Column<StampCardListItem>[] = [
    {
      key: "title",
      header: "Title",
      headClassName: "w-[22%]",
      cell: (c) => <span className="font-medium">{c.title}</span>,
    },
    {
      key: "goal",
      header: "Goal",
      headClassName: "w-[30%]",
      cell: (c) => (
        <span className="text-sm text-muted-foreground whitespace-normal">
          {c.goal_text}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[8%]",
      cell: (c) => <StatusBadge status={c.status} endsAt={c.valid_to} />,
    },
    {
      key: "stamps",
      header: "Stamps",
      headClassName: "w-[10%]",
      cell: (c) => <Badge variant="secondary">{c.stamps_required}</Badge>,
    },
    {
      key: "products",
      header: "Products",
      headClassName: "w-[10%]",
      cell: (c) => <Badge variant="outline">{c.product_count ?? 0}</Badge>,
    },
    {
      key: "validity",
      header: "Validity",
      headClassName: "w-[16%]",
      cell: (c) => (
        <span className="text-sm text-muted-foreground">
          {fmt(c.valid_from)} — {fmt(c.valid_to)}
        </span>
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[10%] text-right",
      cell: (c) => (
        <div className="text-right">
          <StampCardActionsMenu
            card={c}
            deleteStampCard={deleteStampCard}
            onShowLink={(title, path) => setDlg({ title, path })}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      {dlg && (
        <StampJoinLinkDialog
          open
          onOpenChange={(open) => !open && setDlg(null)}
          cardTitle={dlg.title}
          joinPath={dlg.path}
        />
      )}

      <ResponsiveListTable<StampCardListItem>
        items={cards}
        getRowKey={(c) => c.id}
        emptyState={emptyState}
        /* Mobile cards */
        renderMobileCard={(c) => {
          const joinPath = `/services/stamps/${c.id}/join`;
          return (
            <div key={c.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {c.goal_text}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {c.stamps_required} stamps
                    </Badge>
                    <Badge variant="outline">
                      {c.product_count ?? 0} products
                    </Badge>
                    {c.status === "active" ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    {fmt(c.valid_from)} — {fmt(c.valid_to)}
                  </div>
                </div>

                {/* Actions (mobile: Join + Punch buttons + kebab) */}
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <MobileJoinButton cardId={c.id} />
                  <MobilePunchButton cardId={c.id} />
                  <StampCardActionsMenu
                    card={c}
                    deleteStampCard={deleteStampCard}
                    onShowLink={(title, path) => setDlg({ title, path })}
                    align="end"
                    buttonClassName="shrink-0"
                  />
                </div>
              </div>
            </div>
          );
        }}
        /* Desktop columns */
        columns={columns}
      />
    </>
  );
}
