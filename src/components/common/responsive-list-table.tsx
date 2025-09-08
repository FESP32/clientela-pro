// components/dashboard/common/responsive-list-table.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  headClassName?: string;
  cellClassName?: string;
};

type ResponsiveListTableProps<T> = {
  items: T[];
  getRowKey: (item: T, index: number) => React.Key;
  renderMobileCard: (item: T) => React.ReactNode;
  columns: Column<T>[];
  emptyState?: React.ReactNode;
  mobileListClassName?: string;
  tableWrapperClassName?: string;
  tableClassName?: string;
};

export default function ResponsiveListTable<T>({
  items,
  getRowKey,
  renderMobileCard,
  columns,
  emptyState,
  mobileListClassName,
  tableWrapperClassName,
  tableClassName,
}: ResponsiveListTableProps<T>) {
  if (!items?.length) {
    return (
      <div
        className={cn(
          // "w-full rounded-lg border-dashed bg-card",
          tableWrapperClassName
        )}
      >
        {emptyState ?? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nothing to show yet.
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className={cn("w-full space-y-3 md:hidden", mobileListClassName)}>
        {items.map((item, i) => (
          <React.Fragment key={getRowKey(item, i)}>
            {renderMobileCard(item)}
          </React.Fragment>
        ))}
      </div>

      {/* Desktop: table */}
      <div
        className={cn(
          "hidden w-full md:block overflow-x-auto",
          tableWrapperClassName
        )}
      >
        <Table className={cn("w-full", tableClassName)}>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={cn(c.headClassName)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={getRowKey(item, i)} className="align-top">
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn(c.cellClassName)}>
                    {c.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
