"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Info,
  Globe,
  Link2,
  Instagram,
  Facebook,
  Image as ImageIcon,
  Store,
} from "lucide-react";
import MonoIcon from "@/components/common/mono-icon";
import SubmitButton from "@/components/common/submit-button";

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

export default function BusinessCreate({
  action,
  initialData = null,
}: {
  action: CreateOrUpdateBusinessAction;
  initialData?: InitialData;
}) {
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(initialData?.id);

  // --- Image preview state ---
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const removeImageRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function clientAction(formData: FormData) {
    setError(null);
    const res = (await action(formData)) as { error?: string } | void;
    if (res && "error" in res && res.error) setError(res.error);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    // Clean up previous preview object URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFileName(null);

    // No file selected (or an empty placeholder)
    if (!file || file.size === 0 || !file.name || file.name === "undefined") {
      return;
    }

    // Only preview image/* types
    if (!file.type.startsWith("image/")) {
      return;
    }

    // If "remove current image" was checked, uncheck it when a new image is chosen
    if (removeImageRef.current && removeImageRef.current.checked) {
      removeImageRef.current.checked = false;
    }

    setSelectedFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleRemoveImageToggle(e: React.ChangeEvent<HTMLInputElement>) {
    // If user chooses to remove, clear any selected preview (stays safe & unambiguous)
    if (e.target.checked && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setSelectedFileName(null);
      // Also clear the file input’s files so the server won’t receive it
      const inputEl = document.getElementById(
        "image"
      ) as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
    }
  }

  return (
    <form action={clientAction}>
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MonoIcon>
                <Store className="size-4" aria-hidden="true" />
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

            {/* Current image (edit) */}
            {isEditing && initialData?.image_url && !previewUrl ? (
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
                    ref={removeImageRef}
                    onChange={handleRemoveImageToggle}
                  />
                  <Label htmlFor="remove_image">Remove current image</Label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Uploading a new image will replace and delete the current one.
                </p>
              </div>
            ) : null}

            {/* New image upload + live preview */}
            <div className="space-y-2">
              <Label htmlFor="image" className="inline-flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                {isEditing
                  ? "Replace cover image (optional)"
                  : "Cover image (optional)"}
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              {/* Selected file name (if any) */}
              {selectedFileName ? (
                <p className="text-[11px] text-muted-foreground">
                  Selected: {selectedFileName}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  JPG/PNG up to 5MB. Use a wide image for best results.
                </p>
              )}

              {/* Live preview when a file is chosen */}
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="New image preview"
                  className="mt-2 h-28 w-auto rounded-md border object-cover"
                />
              ) : null}
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
              displayText={isEditing ? "Save changes" : "Create Business"}
            />
          </div>
        </section>
      </div>
    </form>
  );
}
