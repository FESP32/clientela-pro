"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Info,
  Globe,
  Link2,
  Instagram,
  Facebook,
  Image as ImageIcon,
  Store,
} from "lucide-react";
import MonoIcon from "@/components/common/mono-icon";

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
    <form action={clientAction}>
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MonoIcon>
                <Store
                  className="size-4"
                  aria-hidden="true"
                />
              </MonoIcon>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {isEditing ? "Edit business" : "Create business"}
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Info className="h-4 w-4" aria-hidden="true" />
                Set your public details, links & branding.
              </span>
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/dashboard/businesses">Cancel</Link>
          </Button>
        </header>

        {/* Body */}
        <section className="space-y-10">
          {/* Error (if any) */}
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {/* Hidden ID for edit */}
          {isEditing ? (
            <input type="hidden" name="id" value={String(initialData!.id)} />
          ) : null}

          {/* Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">
              Business details
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="name"
                  className="inline-flex items-center gap-2"
                >
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Acme Coffee"
                  required
                  defaultValue={initialData?.name ?? ""}
                />
                <p className="text-[11px] text-muted-foreground">
                  Use your customer-facing brand name.
                </p>
              </div>

              <div className="flex flex-col gap-2 md:col-span-1">
                <Label
                  htmlFor="website_url"
                  className="inline-flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Website URL
                </Label>
                <Input
                  id="website_url"
                  name="website_url"
                  type="url"
                  placeholder="https://example.com"
                  defaultValue={initialData?.website_url ?? ""}
                />
                <p className="text-[11px] text-muted-foreground">
                  Optional. Public site for your business.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="description"
                className="inline-flex items-center gap-2"
              >
                <Info className="h-4 w-4 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Short description"
                defaultValue={initialData?.description ?? ""}
              />
              <p className="text-[11px] text-muted-foreground">
                Briefly explain what you do. Keep it concise.
              </p>
            </div>
          </section>

          <Separator />

          {/* Social links */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">Links</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="instagram_url"
                  className="inline-flex items-center gap-2"
                >
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  Instagram URL
                </Label>
                <Input
                  id="instagram_url"
                  name="instagram_url"
                  type="url"
                  placeholder="https://instagram.com/yourbiz"
                  defaultValue={initialData?.instagram_url ?? ""}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="facebook_url"
                  className="inline-flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4 text-muted-foreground" />
                  Facebook URL
                </Label>
                <Input
                  id="facebook_url"
                  name="facebook_url"
                  type="url"
                  placeholder="https://facebook.com/yourbiz"
                  defaultValue={initialData?.facebook_url ?? ""}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Branding */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">
              Branding
            </h3>

            {isEditing && initialData?.image_url ? (
              <div className="space-y-2">
                <Label className="inline-flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Current cover image
                </Label>
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
                <p className="text-[11px] text-muted-foreground">
                  Uploading a new image will replace and delete the current one.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="image" className="inline-flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                {isEditing
                  ? "Replace cover image (optional)"
                  : "Cover image (optional)"}
              </Label>
              <Input id="image" name="image" type="file" accept="image/*" />
              <p className="text-[11px] text-muted-foreground">
                JPG/PNG up to 5MB. Use a wide image for best results.
              </p>
            </div>
          </section>

          <Separator />

          {/* Status */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/80">Status</h3>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="pr-4">
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Make this the active business for your dashboard.
                </p>
              </div>
              {/* Keep checkbox for reliable form submission */}
              <Input
                id="is_active"
                name="is_active"
                type="checkbox"
                className="size-4"
                defaultChecked={initialData?.is_active ?? false}
                aria-label="Set as active"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/businesses">Cancel</Link>
            </Button>
            <SubmitButton
              label={isEditing ? "Save changes" : "Create Business"}
              pendingLabel={isEditing ? "Saving..." : "Creating..."}
            />
          </div>
        </section>
      </div>
    </form>
  );
}
