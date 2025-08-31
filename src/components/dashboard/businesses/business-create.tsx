"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type ActionResult = { error?: string } | void;

type CreateOrUpdateBusinessAction = (
  formData: FormData
) => Promise<ActionResult>;

type InitialData = {
  id: string | number;
  name: string;
  description: string | null;
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  image_url: string | null;
  is_active: boolean;
} | null;

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingLabel ?? "Saving..." : label}
    </Button>
  );
}

export default function BusinessCreate({
  action,
  initialData = null,
}: {
  action: CreateOrUpdateBusinessAction;
  initialData?: InitialData;
}) {
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(initialData?.id);

  async function clientAction(formData: FormData) {
    setError(null);
    const res = (await action(formData)) as { error?: string } | void;
    if (res && "error" in res && res.error) setError(res.error);
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit business" : "Create a new business"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* NOTE: no method / encType — React sets them automatically for action functions */}
        <form action={clientAction} className="space-y-6">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {/* Hidden ID for edit */}
          {isEditing ? (
            <input type="hidden" name="id" value={String(initialData!.id)} />
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Coffee"
              required
              defaultValue={initialData?.name ?? ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Short description"
              defaultValue={initialData?.description ?? ""}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              placeholder="https://example.com"
              defaultValue={initialData?.website_url ?? ""}
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
                defaultValue={initialData?.instagram_url ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                name="facebook_url"
                type="url"
                placeholder="https://facebook.com/yourbiz"
                defaultValue={initialData?.facebook_url ?? ""}
              />
            </div>
          </div>

          {/* Existing image preview + remove toggle when editing */}
          {isEditing && initialData?.image_url ? (
            <div className="space-y-2">
              <Label>Current cover image</Label>
              <img
                src={initialData.image_url}
                alt="Current cover"
                className="h-28 w-auto rounded-md border object-cover"
              />
              <div className="flex items-center gap-2">
                <Input
                  id="remove_image"
                  name="remove_image"
                  type="checkbox"
                  className="size-4"
                />
                <Label htmlFor="remove_image">Remove current image</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                If you upload a new image, it will replace the current one (and
                the current one will be deleted).
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="image">
              {isEditing
                ? "Replace cover image (optional)"
                : "Cover image (optional)"}{" "}
            </Label>
            <Input id="image" name="image" type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground">JPG/PNG, up to 5MB.</p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="is_active"
              name="is_active"
              type="checkbox"
              className="size-4"
              defaultChecked={initialData?.is_active ?? false}
            />
            <Label htmlFor="is_active">Set as active</Label>
          </div>

          <div className="pt-2">
            <SubmitButton
              label={isEditing ? "Save changes" : "Create Business"}
              pendingLabel={isEditing ? "Saving..." : "Creating..."}
            />
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
