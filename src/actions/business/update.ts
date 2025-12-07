"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function setActiveBusiness(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("business_id") ?? "").trim();
  if (!id) throw new Error("Missing business id");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be logged in to set an active business.");
  }

  // 1) Check membership in business_users
  const { data: membership, error: membershipErr } = await supabase
    .from("business_user")
    .select("business_id")
    .eq("business_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipErr) {
    throw new Error(membershipErr.message);
  }

  // 2) If not in business_users, allow owner as implicit member
  let isAllowed = Boolean(membership);
  if (!isAllowed) {
    const { data: own, error: ownErr } = await supabase
      .from("business")
      .select("id")
      .eq("id", id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (ownErr) {
      throw new Error(ownErr.message);
    }
    isAllowed = Boolean(own);
  }

  if (!isAllowed) {
    throw new Error(
      "You must be a member of this business to set it as active."
    );
  }

  // Upsert into business_current
  const { error } = await supabase.from("business_current").upsert(
    {
      user_id: user.id,
      business_id: id,
      set_at: new Date().toISOString(),
    },
    { onConflict: "user_id" } // ensures one active business per user
  );

  if (error) {
    throw new Error(error.message);
  }

  // Refresh cache wherever needed
  revalidatePath("/dashboard/businesses");
}

export async function toggleBusinessIsActive(
  formData: FormData
): Promise<void> {
  const supabase = await createClient();

  const id = String(formData.get("business_id") ?? "").trim();
  if (!id) throw new Error("Missing business id");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // Fetch business (owner + current state)
  const { data: business, error: bizErr } = await supabase
    .from("business")
    .select("id, owner_id, is_active")
    .eq("id", id)
    .maybeSingle();

  if (bizErr) throw new Error(bizErr.message);
  if (!business) throw new Error("Business not found.");

  // Permission: owner or admin
  let allowed = business.owner_id === user.id;
  if (!allowed) {
    const { data: membership, error: memErr } = await supabase
      .from("business_user")
      .select("role")
      .eq("business_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (memErr) throw new Error(memErr.message);
    allowed = membership?.role === "owner" || membership?.role === "admin";
  }
  if (!allowed) {
    throw new Error(
      "You don’t have permission to change this business status."
    );
  }

  const newState = !Boolean(business.is_active);

  const { data: updated, error: updateErr } = await supabase
    .from("business")
    .update({ is_active: newState })
    .eq("id", id)
    .select("is_active")
    .maybeSingle();

  if (updateErr) throw new Error(updateErr.message);

  console.log(updated);

  // Revalidate list + detail
  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${id}`);
}

export async function acceptBusinessInvite(formData: FormData) {
  const supabase = await createClient();

  const inviteId = String(formData.get("invite_id") ?? "").trim();
  if (!inviteId) throw new Error("Missing invite id");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to accept an invite.");

  // Load invite with role + business owner
  const { data: invite, error: invErr } = await supabase
    .from("business_invite")
    .select(
      `
      id, business_id, status, invited_user, role,
      business:business ( id, owner_id )
    `
    )
    .eq("id", inviteId)
    .maybeSingle();
  if (invErr) throw new Error(invErr.message);
  if (!invite) throw new Error("Invite not found.");
  if (invite.status !== "pending")
    throw new Error("This invite is not pending.");

  // Owner cannot accept
  if (invite.business?.owner_id === user.id) {
    throw new Error(
      "You are the owner of this business and cannot accept this invite."
    );
  }

  // Existing members cannot accept
  const { data: existingMember, error: memErr } = await supabase
    .from("business_user")
    .select("user_id")
    .eq("business_id", invite.business_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (memErr) throw new Error(memErr.message);
  if (existingMember)
    throw new Error("You are already a member of this business.");

  // Assign the invited role (member/admin)
  const role = invite.role === "admin" ? "admin" : "member";

  const { error: upsertErr } = await supabase.from("business_user").upsert(
    {
      business_id: invite.business_id,
      user_id: user.id,
      role,
    },
    { onConflict: "business_id, user_id", ignoreDuplicates: true }
  );
  if (upsertErr) throw new Error(upsertErr.message);

  const { error: updErr } = await supabase
    .from("business_invite")
    .delete()
    .eq("id", inviteId);
  if (updErr) throw new Error(updErr.message);

  revalidatePath(`/dashboard/businesses/${invite.business_id}`);
  revalidatePath("/dashboard/businesses");
  redirect("/dashboard/businesses");
}

export async function getBusinessInvites(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_invite")
    .select(
      `
      id, business_id, invited_by, role, invited_user, status, created_at, updated_at,
      inviter:profile!business_invite_invited_by_fk_profile ( user_id, name ),
      invitee:profile!business_invite_invited_user_fk_profile ( user_id, name )
    `
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateBusiness(formData: FormData) {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ID (required)
  const businessId = String(formData.get("id") ?? "").trim();
  if (!businessId) throw new Error("Missing business id.");

  // Fetch current to validate ownership & get current image_path
  const { data: existing, error: fetchErr } = await supabase
    .from("business")
    .select("id, owner_id, image_path")
    .eq("id", businessId)
    .single();

  if (fetchErr || !existing) throw new Error("Business not found.");
  if (existing.owner_id !== user.id) throw new Error("Not allowed.");

  // Read form fields
  const name = String(formData.get("name") ?? "").trim();
  const description =
    ((formData.get("description") as string) ?? "").trim() || null;
  const website_url =
    ((formData.get("website_url") as string) ?? "").trim() || null;
  const instagram_url =
    ((formData.get("instagram_url") as string) ?? "").trim() || null;
  const facebook_url =
    ((formData.get("facebook_url") as string) ?? "").trim() || null;
  const is_active = formData.get("is_active") === "on";
  const imageFile = formData.get("image") as File | null;
  const removeImage = formData.get("remove_image") === "on";

  if (!name) throw new Error("Name is required.");

  // Optional image validation
  if (imageFile && imageFile.size > 0) {
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxBytes)
      throw new Error("Image must be 5MB or smaller.");
    if (!imageFile.type?.startsWith("image/"))
      throw new Error("Only image files are allowed.");
  }

  // Prepare new image (if any). We upload first; only after a successful DB update we delete the old file.
  let nextImagePath: string | null | undefined = undefined; // undefined = don't touch; null = clear; string = new
  let nextImageUrl: string | null | undefined = undefined;

  if (imageFile && imageFile.size > 0) {
    const extFromName = imageFile.name?.split(".").pop()?.toLowerCase();
    const extFromType = imageFile.type?.replace("image/", "");
    const ext = extFromName || extFromType || "jpg";

    const objectPath = `business/${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("public-images")
      .upload(objectPath, imageFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.type || "image/*",
      });

    if (uploadErr) throw new Error(uploadErr.message);

    const { data: pub } = supabase.storage
      .from("public-images")
      .getPublicUrl(objectPath);
    nextImagePath = objectPath;
    nextImageUrl = pub.publicUrl;
  } else if (removeImage) {
    nextImagePath = null;
    nextImageUrl = null;
  }

  // Build update payload (only set image fields when needed)
  const updatePayload: Record<string, unknown> = {
    name,
    description,
    website_url,
    instagram_url,
    facebook_url,
    is_active,
  };
  if (nextImagePath !== undefined) updatePayload.image_path = nextImagePath;
  if (nextImageUrl !== undefined) updatePayload.image_url = nextImageUrl;

  const { error: updateErr } = await supabase
    .from("business")
    .update(updatePayload)
    .eq("id", businessId);

  if (updateErr) throw new Error(updateErr.message);

  // If we replaced or removed the image, delete the previous blob (best-effort).
  const shouldDeleteOld =
    (imageFile && imageFile.size > 0 && existing.image_path) ||
    (removeImage && existing.image_path);
  if (shouldDeleteOld) {
    await supabase.storage
      .from("public-images")
      .remove([existing.image_path as string]);
  }

  // Refresh + navigate back
  revalidatePath("/dashboard/businesses");
  revalidatePath(`/dashboard/businesses/${businessId}`);
  redirect("/dashboard/businesses?updated=1");
}

