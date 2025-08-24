"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type CreateBusinessAction = (
  formData: FormData
) => Promise<{ error?: string } | void>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create Business"}
    </Button>
  );
}

export default function BusinessCreate({
  action,
}: {
  action: CreateBusinessAction;
}) {
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    setError(null);
    const res = (await action(formData)) as { error?: string } | void;
    if (res && "error" in res && res.error) setError(res.error);
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create a new business</CardTitle>
      </CardHeader>
      <CardContent>
        {/* NOTE: no method / encType — React sets them automatically for action functions */}
        <form action={clientAction} className="space-y-6">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Acme Coffee" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Short description"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              placeholder="https://example.com"
            />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                placeholder="https://instagram.com/yourbiz"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                name="facebook_url"
                type="url"
                placeholder="https://facebook.com/yourbiz"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Cover image (optional)</Label>
            <Input id="image" name="image" type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground">JPG/PNG, up to 5MB.</p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="is_active"
              name="is_active"
              type="checkbox"
              className="size-4"
            />
            <Label htmlFor="is_active">Set as active</Label>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button asChild variant="ghost">
          <Link href="/dashboard/businesses">Back to list</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
