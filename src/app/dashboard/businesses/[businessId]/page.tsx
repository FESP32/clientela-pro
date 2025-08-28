// app/dashboard/businesses/[businessId]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  createBusinessInvite,
  getBusinessDetail,
  getBusinessInvites,
  setActiveBusiness,
  deleteBusiness,
} from "@/actions/businesses";
import { createClient } from "@/utils/supabase/server";
import type { BusinessDetail } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmt } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/businesses/status-badge";
import RoleBadge from "@/components/dashboard/businesses/role-badge";
import BusinessInvite from "@/components/dashboard/businesses/business-invite";
import InvitesTable from "@/components/dashboard/businesses/invites-table";
import { Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;

  let detail: BusinessDetail | null = null;
  try {
    detail = await getBusinessDetail(businessId);
  } catch {
    notFound();
  }
  if (!detail) notFound();

  // Current user (to decide if we show Delete)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === detail.owner?.user_id;

  const invites = await getBusinessInvites(detail.id);
  const ownerName = detail.owner?.name ?? "—";
  const initial = detail.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
              {detail.image_url ? (
                <Image
                  src={detail.image_url}
                  alt={`${detail.name} logo`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  {initial}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {detail.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge active={detail.is_active} />
                <span className="text-sm text-muted-foreground">
                  Created {fmt(detail.created_at)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Owner: {ownerName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions: stack on mobile, inline on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/businesses/${detail.id}/invite`}>
              Invite members
            </Link>
          </Button>

          {/* Set as active */}
          <form action={setActiveBusiness}>
            <input type="hidden" name="business_id" value={detail.id} />
            <Button type="submit" className="w-full sm:w-auto">
              Set active
            </Button>
          </form>

          {/* Delete business (owner only) */}
          {isOwner && (
            <form action={deleteBusiness} className="col-span-2 sm:col-span-1">
              <input type="hidden" name="business_id" value={detail.id} />
              <Button
                type="submit"
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Delete
              </Button>
            </form>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {detail.description?.trim() || "No description provided."}
          </p>
        </CardContent>
      </Card>

      {/* Members */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.members?.length ? (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {detail.members.map((m) => (
                    <div
                      key={`${m.user_id}-${m.created_at}`}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium">
                            {m.profile?.name ?? "—"}
                          </div>
                          <div className="mt-1">
                            <RoleBadge role={m.role} />
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Joined {fmt(m.created_at)}
                          </div>
                          <div className="mt-1 text-[11px] text-muted-foreground break-all">
                            {m.user_id}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Link
                            href={`/dashboard/businesses/${detail.id}`}
                            className="inline-flex items-center text-sm text-muted-foreground hover:underline"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[240px]">Name</TableHead>
                        <TableHead className="w-[140px]">Role</TableHead>
                        <TableHead className="w-[160px]">Joined</TableHead>
                        <TableHead className="w-[180px]">User ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.members.map((m) => (
                        <TableRow key={`${m.user_id}-${m.created_at}`}>
                          <TableCell>{m.profile?.name ?? "—"}</TableCell>
                          <TableCell>
                            <RoleBadge role={m.role} />
                          </TableCell>
                          <TableCell>{fmt(m.created_at)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {m.user_id}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <BusinessInvite
              businessId={detail.id}
              action={createBusinessInvite}
            />
          </CardFooter>
        </Card>

        {/* Invites */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invites</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {invites.length ? (
                  invites.map((i) => (
                    <div key={i.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium break-all">
                            {i.id}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Role:{" "}
                            <span className="align-middle">
                              <RoleBadge role={i.role} />
                            </span>
                          </div>
                          <div className="mt-1 text-xs">
                            Status:{" "}
                            <span className="capitalize">{i.status}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Invited by: {i.inviter?.name ?? "—"}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Accepted by: {i.invitee?.name ?? "—"}
                          </div>
                          <div className="mt-2 text-[11px] text-muted-foreground">
                            {fmt(i.created_at)} · Updated {fmt(i.updated_at)}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/dashboard/businesses/invite/${i.id}`}>
                              Open
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No invites yet.
                  </p>
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <InvitesTable
                  invites={invites}
                  businessName={detail.name}
                  publicLinkPrefix="/dashboard/businesses/invite"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
