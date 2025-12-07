// components/dashboard/businesses/invite-create.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useId } from "react";
import SubmitButton from "@/components/common/submit-button";

type CreateInviteAction = (formData: FormData) => Promise<void>;

export default function InviteCreate({
  businessId,
  action,
}: {
  businessId: string;
  action: CreateInviteAction;
}) {
  const emailId = useId();
  const roleId = useId();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create invite link</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={action}
          className="grid gap-4 sm:grid-cols-[1fr_240px_auto] sm:items-end"
        >
          <input type="hidden" name="business_id" value={businessId} />
          <div className="grid gap-2">
            <Label htmlFor={emailId}>Email</Label>
            <input
              id={emailId}
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              We’ll send the invite to this address.
            </p>
          </div>

          {/* Role */}
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
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
