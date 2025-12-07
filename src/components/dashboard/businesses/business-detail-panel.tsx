// Server component (no "use client")
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getBusinessDetail,
  getBusinessInvites,
  createBusinessInvite,
  setActiveBusiness,
  deleteBusiness,
} from "@/actions";
import type { BusinessDetail } from "@/types";

import MerchantListSection from "@/components/common/merchant-list-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RoleBadge from "@/components/dashboard/businesses/role-badge";
import { StatusBadge } from "@/components/dashboard/businesses/status-badge";
import BusinessInvite from "@/components/dashboard/businesses/business-invite";
import InvitesTable from "@/components/dashboard/businesses/invites-table";
import { ConfirmDeleteMenuItem } from "@/components/common/confirm-delete-menu-item";
import { Eye } from "lucide-react";
import { fmt } from "@/lib/utils";

export default async function BusinessDetailPanel({
  businessId,
}: {
  businessId: string;
}) {
  const detail = (await getBusinessDetail(businessId).catch(
    () => null
  )) as BusinessDetail | null;
  if (!detail) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === detail.owner?.user_id;

  const invites = await getBusinessInvites(detail.id);

  const memberCount = detail.members?.length ?? 0;
  const inviteCount = invites.length;
  const pendingInvites = invites.filter((i) => i.status === "pending").length;

  const ownerName = detail.owner?.name ?? "—";
  const initial = detail.name?.[0]?.toUpperCase() ?? "?";

  return (
    <MerchantListSection
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Business — {detail.name}</span>
          <Badge variant="secondary">{memberCount} members</Badge>
          <Badge variant="outline">{inviteCount} invites</Badge>
          {pendingInvites > 0 && <Badge>{pendingInvites} pending</Badge>}
          <StatusBadge active={detail.is_active} />
        </div>
      }
      subtitle={
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <span>Owner: {ownerName}</span>
          <span>Created {fmt(detail.created_at)}</span>
        </div>
      }
    >
      {/* Actions row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
            {detail.image_url ? (
              <Image
                src={detail.image_url}
                alt={`${detail.name} logo`}
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
          <div className="text-sm text-muted-foreground">
            {detail.description?.trim() || "No description provided."}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
          {isOwner && (
            <ConfirmDeleteMenuItem
              action={deleteBusiness}
              hiddenFields={{ business_id: businessId }}
              label="Delete"
              title="Delete business"
              description="This action cannot be undone. This will permanently delete the business."
              resourceLabel={detail.name}
              mode="button"
              className="w-full sm:w-auto"
              buttonVariant="destructive"
              buttonSize="default"
            />
          )}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Members */}
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
                          Status: <span className="capitalize">{i.status}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Invited by: {i.inviter?.name ?? "—"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Accepted by: {i.invitee?.name ?? "—"}
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
                <p className="text-sm text-muted-foreground">No invites yet.</p>
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
      <div className="my-8">
        <Button asChild variant="outline">
          <Link href="/dashboard/businesses">Back to Businesses</Link>
        </Button>
      </div>
    </MerchantListSection>
  );
}
