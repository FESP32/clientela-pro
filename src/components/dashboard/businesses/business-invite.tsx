// components/dashboard/businesses/invite-create.tsx
"use client";


import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useId } from "react";

type CreateInviteAction = (formData: FormData) => Promise<void>;

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create invite"}
    </Button>
  );
}

export default function InviteCreate({
  businessId,
  action,
  title = "Create invite link",
}: {
  businessId: string;
  action: CreateInviteAction;
  title?: string;
}) {

    const roleId = useId();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={action}
          className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <input type="hidden" name="business_id" value={businessId} />

          <div className="grid gap-2">
            <Label htmlFor={roleId}>Role</Label>
            <select
              id={roleId}
              name="role"
              defaultValue="member"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Only the owner can issue admin invites.
            </p>
          </div>

          <div className="sm:justify-self-end">
            <SubmitBtn />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
