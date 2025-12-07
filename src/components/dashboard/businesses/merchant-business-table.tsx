// components/dashboard/businesses/merchant-business-table.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  MoreHorizontal,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Edit,
} from "lucide-react";

import { fmt } from "@/lib/utils";
import RoleBadge from "./role-badge";
import { StatusBadge } from "./status-badge";
import type { BusinessWithMembership } from "@/types";
import { toggleBusinessIsActive } from "@/actions";

import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";

type SetActiveAction = (formData: FormData) => Promise<void>;

function BusinessActionsMenu({
  business,
  setActiveAction,
  align = "end",
  buttonClassName,
}: {
  business: BusinessWithMembership;
  setActiveAction: SetActiveAction;
  align?: "start" | "end";
  buttonClassName?: string;
}) {
  const isActive = Boolean(business.is_active);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${business.name}`}
          className={buttonClassName}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-52">
        {/* View */}
        <DropdownMenuItem
          asChild
          className="text-primary data-[highlighted]:bg-primary/10"
        >
          <Link
            href={`/dashboard/businesses/${business.id}`}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>

        {/* Edit */}
        <DropdownMenuItem
          asChild
          className="text-sky-600 data-[highlighted]:bg-sky-50 dark:data-[highlighted]:bg-sky-950/30"
        >
          <Link
            href={`/dashboard/businesses/${business.id}/edit`}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Toggle Active / Inactive */}
        <DropdownMenuItem
          asChild
          className={
            isActive
              ? "text-zinc-700 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-900"
              : "text-green-600 data-[highlighted]:bg-green-50 dark:data-[highlighted]:bg-green-950/30"
          }
        >
          <form action={toggleBusinessIsActive} className="w-full">
            <input type="hidden" name="business_id" value={business.id} />
            <button type="submit" className="flex w-full items-center gap-2">
              {isActive ? (
                <ToggleLeft className="h-4 w-4" />
              ) : (
                <ToggleRight className="h-4 w-4" />
              )}
              {isActive ? "Set inactive" : "Set active"}
            </button>
          </form>
        </DropdownMenuItem>

        {/* Set as current */}
        <DropdownMenuItem
          asChild
          className="text-emerald-600 data-[highlighted]:bg-emerald-50 dark:data-[highlighted]:bg-emerald-950/30"
        >
          <form action={setActiveAction} className="w-full">
            <input type="hidden" name="business_id" value={business.id} />
            <button type="submit" className="flex w-full items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Set as current
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* -------------------------------------------
 * Mobile quick-action: Set current
 * ------------------------------------------- */
function MobileSetCurrentButton({
  id,
  setActiveAction,
  className,
}: {
  id: string | number;
  setActiveAction: SetActiveAction;
  className?: string;
}) {
  return (
    <form action={setActiveAction}>
      <input type="hidden" name="business_id" value={id} />
      <Button
        type="submit"
        aria-label="Set as current business"
        variant="secondary"
        className={`md:hidden h-11 px-4 rounded-full shadow-sm active:scale-[0.98] ${
          className ?? ""
        }`}
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        Set current
      </Button>
    </form>
  );
}

export default function MerchantBusinessTable({
  items,
  setActiveAction,
}: {
  items: BusinessWithMembership[];
  setActiveAction: SetActiveAction;
}) {
  const emptyState = (
    <Card className="border-dashed">
      <CardContent className="py-10 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          You don’t belong to any business yet.
        </p>
        <Button asChild>
          <Link href="/dashboard/businesses/new">
            Create your first business
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  const columns: Column<BusinessWithMembership>[] = [
    {
      key: "name",
      header: "Name",
      headClassName: "min-w-[260px]",
      cell: (b) => {
        const img = b.image_url ?? null;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
              {img ? (
                <Image
                  src={img}
                  alt={`${b.name} logo`}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  {b.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <Link
              href={`/dashboard/businesses/${b.id}`}
              className="hover:underline"
            >
              {b.name}
            </Link>
          </div>
        );
      },
    },
    {
      key: "description",
      header: "Description",
      headClassName: "min-w-[200px]",
      cell: (b) => (
        <span className="text-muted-foreground">{b.description ?? "—"}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      headClassName: "w-[110px]",
      cell: (b) => <RoleBadge role={b.membership?.[0]?.role} />,
    },
    {
      key: "status",
      header: "Status",
      headClassName: "w-[110px]",
      cell: (b) => <StatusBadge active={Boolean(b.is_active)} />,
    },
    {
      key: "joined",
      header: "Joined",
      headClassName: "w-[140px]",
      cell: (b) => fmt(b.membership?.[0]?.created_at),
    },
    {
      key: "created",
      header: "Created",
      headClassName: "w-[140px]",
      cell: (b) => fmt(b.created_at),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[60px] text-right",
      cell: (b) => (
        <div className="text-right">
          <BusinessActionsMenu business={b} setActiveAction={setActiveAction} />
        </div>
      ),
    },
  ];

  return (
    <ResponsiveListTable<BusinessWithMembership>
      items={items}
      getRowKey={(b) => b.id}
      emptyState={emptyState}
      /* Mobile cards */
      renderMobileCard={(b) => {
        const me = b.membership?.[0];
        const img = b.image_url ?? null;
        const initial = b.name?.[0]?.toUpperCase() ?? "?";

        return (
          <div key={b.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted shrink-0">
                    {img ? (
                      <Image
                        src={img}
                        alt={`${b.name} logo`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        {initial}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/businesses/${b.id}`}
                      className="block truncate font-medium hover:underline"
                    >
                      {b.name}
                    </Link>
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {b.description ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <RoleBadge role={me?.role} />
                  <StatusBadge active={Boolean(b.is_active)} />
                </div>

                <div className="mt-2 flex flex-col text-xs text-muted-foreground">
                  <div>
                    <span className="mr-1">Joined:</span>
                    {fmt(me?.created_at)}
                  </div>
                  <div>
                    <span className="mr-1">Created:</span>
                    {fmt(b.created_at)}
                  </div>
                </div>
              </div>

              {/* Actions (mobile: big Set current + kebab) */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                <MobileSetCurrentButton
                  id={b.id}
                  setActiveAction={setActiveAction}
                />
                <BusinessActionsMenu
                  business={b}
                  setActiveAction={setActiveAction}
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
  );
}
