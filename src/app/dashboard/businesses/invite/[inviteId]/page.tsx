// app/invite/[inviteId]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { acceptBusinessInvite } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmt } from "@/lib/utils";
import RoleBadge from "@/components/dashboard/businesses/role-badge";

async function getBusinessInvite(inviteId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invite, error } = await supabase
    .from("business_invite")
    .select(
      `
      id, status, created_at, updated_at, role,
      business:business ( id, name, image_url, owner_id )
    `
    )
    .eq("id", inviteId)
    .maybeSingle();

  // if (error) throw new Error(error.message);
  if (error) throw new Error(error.message);  
  if (!invite)
    return { user, invite: null, alreadyOwner: false, alreadyMember: false };

  // membership check (only if logged in)
  let alreadyOwner = false;
  let alreadyMember = false;

  if (user?.id) {
    alreadyOwner = invite.business?.owner_id === user.id;

    if (!alreadyOwner) {
      const { data: memberRow } = await supabase
        .from("business_user")
        .select("user_id")
        .eq("business_id", invite.business.id)
        .eq("user_id", user.id)
        .maybeSingle();
      alreadyMember = Boolean(memberRow);
    }
  }

  return { user, invite, alreadyOwner, alreadyMember };
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}) {
  const { inviteId } = await params;
  
  const { user, invite, alreadyOwner, alreadyMember } = await getBusinessInvite(
    inviteId
  ).catch(() => ({
    user: null,
    invite: null,
    alreadyOwner: false,
    alreadyMember: false,
  }));

  if (!invite) notFound();

  const business = invite.business;
  const disabledByStatus = invite.status !== "pending";
  const disabledByAuth = !user?.id;
  const disabledByOwnerOrMember = alreadyOwner || alreadyMember;

  const disabled =
    disabledByStatus || disabledByAuth || disabledByOwnerOrMember;

  let disabledReason = "";
  if (disabledByStatus) disabledReason = `Invite ${invite.status}.`;
  else if (disabledByAuth)
    disabledReason = "You must be signed in to accept this invite.";
  else if (alreadyOwner) disabledReason = "You are the owner of this business.";
  else if (alreadyMember)
    disabledReason = "You are already a member of this business.";

  const initial = business?.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="mx-auto w-full max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Join {business?.name ?? "this business"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
              {business?.image_url ? (
                <Image
                  src={business.image_url}
                  alt={`${business.name} logo`}
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
            <div className="text-sm text-muted-foreground">
              {fmt(invite.created_at)}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                <RoleBadge role={invite.role} />
              </div>
            </div>
          </div>

          <form action={acceptBusinessInvite} className="space-y-2">
            <input type="hidden" name="invite_id" value={invite.id} />
            <Button type="submit" disabled={disabled}>
              {disabled ? disabledReason : "Accept invite"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
