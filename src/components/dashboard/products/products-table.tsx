"use client";

import { format } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { ProductRow } from "@/types"; // uses your existing type

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type ProductItem = Pick<ProductRow, "id" | "name" | "metadata" | "created_at">;

export default function ProductsTable({
  products,
  deleteProduct,
}: {
  products: ProductItem[];
  deleteProduct: (formData: FormData) => Promise<void>; // server action
}) {
  const renderMeta = (meta: ProductItem["metadata"]) =>
    meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : "—";

  return (
    <>
      {/* Mobile: card list */}
      <div className="space-y-3 md:hidden">
        {products.map((p) => (
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
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[36%]">Name</TableHead>
              <TableHead className="w-[34%]">Metadata</TableHead>
              <TableHead className="w-[18%]">Created</TableHead>
              <TableHead className="w-[12%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {renderMeta(p.metadata)}
                </TableCell>
                <TableCell className="text-sm">
                  {p.created_at ? format(new Date(p.created_at), "PPP") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open actions"
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
