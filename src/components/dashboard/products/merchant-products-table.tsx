// components/dashboard/products/merchant-products-table.tsx
"use client";

import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

import type { ProductRow } from "@/types";
import ResponsiveListTable, {
  type Column,
} from "@/components/common/responsive-list-table";
import { ConfirmDeleteMenuItem } from "@/components/common/confirm-delete-menu-item";

type ProductItem = Pick<ProductRow, "id" | "name" | "metadata" | "created_at">;

/* -------------------------------------------
 * Reusable actions menu (desktop + mobile)
 * ------------------------------------------- */
function ProductActionsMenu({
  product,
  deleteProduct,
  align = "end",
  buttonClassName,
}: {
  product: ProductItem;
  deleteProduct: (formData: FormData) => Promise<void>;
  align?: "start" | "end";
  buttonClassName?: string;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open actions for ${product.name}`}
          className={buttonClassName}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {/* Delete with shadcn AlertDialog confirm + loading state */}
        <ConfirmDeleteMenuItem
          action={deleteProduct}
          hiddenFields={{ id: product.id }}
          label="Delete"
          title="Delete product"
          description="This action cannot be undone. This will permanently delete the product"
          resourceLabel={product.name}
          // keep nonModal behavior to avoid inert issues when closing from a dropdown
          nonModal={true}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          <ProductActionsMenu product={p} deleteProduct={deleteProduct} />
        </div>
      ),
    },
  ];

  return (
    <ResponsiveListTable<ProductItem>
      items={products}
      getRowKey={(p) => p.id}
      emptyState={emptyState}
      /* Mobile cards */
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

            {/* Reused actions (mobile) */}
            <ProductActionsMenu
              product={p}
              deleteProduct={deleteProduct}
              align="end"
              buttonClassName="shrink-0"
            />
          </div>
        </div>
      )}
      /* Desktop columns */
      columns={columns}
    />
  );
}
