"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle2,
  ExternalLink,
  Users,
  ToggleLeft,
  Eye,
} from "lucide-react";
import type { BusinessWithMembership } from "@/types";
import { fmt } from "@/lib/utils";
import RoleBadge from "./role-badge";
import { StatusBadge } from "./status-badge";
import { toggleBusinessIsActive } from "@/actions/businesses";

type SetActiveAction = (formData: FormData) => Promise<void>;

export default function BusinessList({
  items,
  setActiveAction,
}: {
  items: BusinessWithMembership[]; // <-- your type, now includes image_url
  setActiveAction: SetActiveAction;
}) {
  if (!items.length) {
    return (
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
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[260px]">Name</TableHead>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead className="w-[110px]">Role</TableHead>
            <TableHead className="w-[110px]">Status</TableHead>
            <TableHead className="w-[140px]">Joined</TableHead>
            <TableHead className="w-[140px]">Created</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((b) => {
            const me = b.membership?.[0];
            const img = b.image_url ?? null;

            return (
              <TableRow key={b.id} className="align-top">
                <TableCell className="font-medium">
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
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {b.description ?? "—"}
                </TableCell>

                <TableCell>
                  <RoleBadge role={me?.role} />
                </TableCell>

                <TableCell>
                  <StatusBadge active={Boolean(b.is_active)} />
                </TableCell>

                <TableCell>{fmt(me?.created_at)}</TableCell>
                <TableCell>{fmt(b.created_at)}</TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Open actions"
                        className="hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/businesses/${b.id}`}>
                        <Eye className="mr-2 h-4 w-4"/>
                          View
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <form
                          action={toggleBusinessIsActive}
                          className="w-full"
                        >
                          <input
                            type="hidden"
                            name="business_id"
                            value={b.id}
                          />
                          <button
                            type="submit"
                            className="flex w-full items-center"
                          >
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Toggle active
                          </button>
                        </form>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <form action={setActiveAction} className="w-full">
                          <input
                            type="hidden"
                            name="business_id"
                            value={b.id}
                          />
                          <button
                            type="submit"
                            className="flex w-full items-center"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Set as current
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
