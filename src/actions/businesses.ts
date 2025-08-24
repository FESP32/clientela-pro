"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { BusinessRow } from "@/types/business";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal("")),
  facebook_url: z.string().url().optional().or(z.literal("")),
  is_active: z
    .union([
      z.literal("on"),
      z.literal("true"),
      z.literal("false"),
      z.literal(""),
    ])
    .optional(),
});

export async function createBusiness(formData: FormData) {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/businesses/new");

  // Read form fields
  const name = String(formData.get("name") ?? "").trim();
  const description = (formData.get("description") as string) || null;
  const website_url = (formData.get("website_url") as string) || null;
  const instagram_url = (formData.get("instagram_url") as string) || null;
  const facebook_url = (formData.get("facebook_url") as string) || null;
  const imageFile = formData.get("image") as File | null;

  if (!name) {
    throw new Error("Name is required.");
  }

  // Optional image validation
  if (imageFile) {
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxBytes) {
      throw new Error("Image must be 5MB or smaller.");
    }
    if (!imageFile.type?.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }
  }

  // Upload (if provided)
  let image_path: string | null = null;
  let image_url: string | null = null;

  if (imageFile) {
    const extFromName = imageFile.name?.split(".").pop()?.toLowerCase();
    const extFromType = imageFile.type?.replace("image/", "");
    const ext = extFromName || extFromType || "jpg";

    // Example object path: businesses/<owner_id>/<uuid>.<ext>
    const objectPath = `businesses/${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("public-images")
      .upload(objectPath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type || "image/*",
      });

    if (uploadErr) {
      throw new Error(uploadErr.message);
    }

    image_path = objectPath;

    // Public URL (no network request)
    const { data: pub } = supabase.storage
      .from("public-images")
      .getPublicUrl(objectPath);
    image_url = pub.publicUrl;
  }

  // Insert the business
  const { error: insertErr } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name,
    description,
    website_url,
    instagram_url,
    facebook_url,
    image_path, // keep the path for future re-issuance / CDN changes
    image_url, // direct public URL for easy rendering
    is_active: false, // or your default
  });

  if (insertErr) {
    throw new Error(insertErr.message);
  }

  // Refresh list + navigate back
  revalidatePath("/dashboard/businesses");
  redirect("/dashboard/businesses?created=1");
}

export async function listMyBusinesses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!user) return { error: "You must be signed in.", data: [] as any[] };

  const { data, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        description,
        website_url,
        instagram_url,
        facebook_url,
        image_path,
        image_url,
        is_active,
        owner_id,
        created_at
      `
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (error) return { error: error.message, data: [] as any[] };

  return { data };
}

export async function setActiveBusiness(formData: FormData) {
  const businessId = String(formData.get("business_id") ?? "").trim();
  if (!businessId) throw new Error("Missing business_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Ensure the selected business belongs to the user
  const { data: owns, error: ownErr } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (ownErr) throw new Error(ownErr.message);
  if (!owns) throw new Error("You do not own this business.");

  // 1) Set all my businesses inactive
  const { error: clearErr } = await supabase
    .from("businesses")
    .update({ is_active: false })
    .eq("owner_id", user.id);
  if (clearErr) throw new Error(clearErr.message);

  // 2) Activate the selected one
  const { error: setErr } = await supabase
    .from("businesses")
    .update({ is_active: true })
    .eq("id", businessId);
  if (setErr) throw new Error(setErr.message);

    revalidatePath("/dashboard/businesses");
  

  // Optional: revalidate paths where you read "active business"
  // import { revalidatePath } from "next/cache";
  // revalidatePath("/(dashboard)"); // or specific paths that depend on active business
}

/**
 * Returns the first active business for the signed-in user.
 * If not signed in, { business: null, error: null } to keep Layout cheap.
 */
export async function getActiveBusiness(): Promise<{
  business: Pick<BusinessRow, "id" | "name" | "image_url"> | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) {
    return { business: null, error: userErr.message };
  }
  if (!user) {
    // No user in layout is a valid state; don't hard-error.
    return { business: null, error: null };
  }

  const { data: biz, error } = await supabase
    .from("businesses")
    .select("id, name, image_url")
    .eq("owner_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<Pick<BusinessRow, "id" | "name" | "image_url">>();

  if (error) return { business: null, error: error.message };
  return { business: biz ?? null, error: null };
}




