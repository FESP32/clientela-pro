"use client";

import { format } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

import type { ProductRow } from "@/types";
import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";

type ProductItem = Pick<ProductRow, "id" | "name" | "metadata" | "created_at">;

export default function MerchantProductsTable({
  products,
  deleteProduct,
}: {
  products: ProductItem[];
  deleteProduct: (formData: FormData) => Promise<void>;
}) {
  const renderMeta = (meta: ProductItem["metadata"]) =>
    meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : "—";

  const emptyState = (
    <Card>
      <CardContent className="py-10 text-center">
        <p className="mb-2 text-sm text-muted-foreground">No products yet.</p>
      </CardContent>
    </Card>
  );

  const columns: Column<ProductItem>[] = [
    {
      key: "name",
      header: "Name",
      headClassName: "w-[36%]",
      cell: (p) => <span className="font-medium">{p.name}</span>,
    },
    {
      key: "metadata",
      header: "Metadata",
      headClassName: "w-[34%]",
      cell: (p) => (
        <span className="text-xs text-muted-foreground break-words">
          {renderMeta(p.metadata)}
        </span>
      ),
    },
    {
      key: "created",
      header: "Created",
      headClassName: "w-[18%]",
      cell: (p) => (p.created_at ? format(new Date(p.created_at), "PPP") : "—"),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headClassName: "w-[12%] text-right",
      cell: (p) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={p.id} />
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
        </div>
      ),
    },
  ];

  return (
    <ResponsiveListTable<ProductItem>
      items={products}
      getRowKey={(p) => p.id}
      emptyState={emptyState}
      renderMobileCard={(p) => (
        <div key={p.id} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="mt-1 text-xs text-muted-foreground break-words">
                {renderMeta(p.metadata)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {p.created_at ? format(new Date(p.created_at), "PPP") : "—"}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open actions"
                  className="shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
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
          </div>
        </div>
      )}
      columns={columns}
    />
  );
}
