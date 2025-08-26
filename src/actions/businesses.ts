"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { BusinessDetail, BusinessWithMembership } from "@/types/business";

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
    const objectPath = `business/${user.id}/${crypto.randomUUID()}.${ext}`;

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

  const { data: business, error: insertErr } = await supabase
    .from("business")
    .insert({
      owner_id: user.id,
      name,
      description,
      website_url,
      instagram_url,
      facebook_url,
      image_path,
      image_url,
      is_active: false,
    })
    .select("id")
    .single();

  if (insertErr) {
    throw new Error(insertErr.message);
  }

  const { error: memberErr } = await supabase.from("business_user").insert({
    business_id: business.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberErr) {
    throw new Error(memberErr.message);
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

  if (!user) return { error: "You must be signed in.", data: [] as BusinessWithMembership[] };

  const { data, error } = await supabase
    .from("business")
    .select(
      `
      id, name, image_url, description, is_active, created_at,
      membership:business_user!inner!business_user_business_id_fk(
        user_id, role, created_at
      )
    `
    )
    .eq("membership.user_id", user.id) // <-- filter by you
    .order("name", { ascending: true }).overrideTypes<BusinessWithMembership[]>();

  if (error) {
    return { error, data: [] as BusinessWithMembership[] };
  }

  return { error: null, data };
}

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

  // Upsert into active_business
  const { error } = await supabase.from("business_active").upsert(
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

export async function getActiveBusiness() {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { business: null, role: null, set_at: null as string | null };
  }

  // Look up user's active business id
  const { data: activeRow, error: activeErr } = await supabase
    .from("business_active")
    .select("business_id, set_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (activeErr) throw new Error(activeErr.message);
  if (!activeRow) {
    return { business: null, role: null, set_at: null as string | null };
  }

  // Fetch the business (RLS will ensure the user can read it)
  const { data: business, error: bizErr } = await supabase
    .from("business")
    .select(
      "id, owner_id, name, description, website_url, instagram_url, facebook_url, image_url, image_path, is_active, created_at, updated_at"
    )
    .eq("id", activeRow.business_id)
    .maybeSingle();

  if (bizErr) throw new Error(bizErr.message);
  if (!business) {
    // Could be filtered by RLS or deleted
    return { business: null, role: null, set_at: null as string | null };
  }

  // Find explicit membership role (if any)
  const { data: membership, error: memErr } = await supabase
    .from("business_user")
    .select("role")
    .eq("business_id", business.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memErr) throw new Error(memErr.message);

  const role =
    membership?.role ??
    (business.owner_id === user.id ? ("owner" as const) : null);

  return { business, role, set_at: activeRow.set_at as string };
}

export async function getBusinessDetail(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business")
    .select(
      `
      id, name, image_url, description, is_active, created_at,

      owner:profile!business_owner_id_fk_profile (
        user_id, name
      ),

      members:business_user!business_user_business_id_fk (
        user_id, role, created_at,
        profile:profile!business_user_user_id_fk_profile ( user_id, name )
      )
    `
    )
    .eq("id", businessId)
    .single()
    .overrideTypes<BusinessDetail>();

  if (error) throw error;
  return data;
}

export async function toggleBusinessIsActive(formData: FormData): Promise<void> {
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

export async function createBusinessInvite(formData: FormData) {
  const supabase = await createClient();

  const businessId = String(formData.get("business_id") ?? "").trim();
  const role = String(formData.get("role") ?? "member")
    .trim()
    .toLowerCase();

  if (!businessId) throw new Error("Missing business id");
  if (!["member", "admin"].includes(role)) throw new Error("Invalid role.");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // Fetch business owner
  const { data: biz, error: bizErr } = await supabase
    .from("business")
    .select("id, owner_id")
    .eq("id", businessId)
    .maybeSingle();
  if (bizErr) throw new Error(bizErr.message);
  if (!biz) throw new Error("Business not found.");

  // Owner or admin can create invites
  const isOwner = biz.owner_id === user.id;
  let isAdmin = false;

  if (!isOwner) {
    const { data: membership, error: memErr } = await supabase
      .from("business_user")
      .select("role")
      .eq("business_id", businessId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (memErr) throw new Error(memErr.message);
    isAdmin = membership?.role === "admin" || membership?.role === "owner";
  }

  if (!(isOwner || isAdmin)) {
    throw new Error("Only owners or admins can create invites.");
  }

  // Only owners can issue admin invites
  if (role === "admin" && !isOwner) {
    throw new Error("Only the owner can invite admins.");
  }

  const { data: created, error: insErr } = await supabase
    .from("business_invite")
    .insert({
      business_id: businessId,
      invited_by: user.id,
      status: "pending",
      role,
    })
    .select("id")
    .maybeSingle();

  if (insErr) throw new Error(insErr.message);
  if (!created?.id) throw new Error("Could not create invite.");

  revalidatePath(`/dashboard/businesses/${businessId}`);
  redirect(`/dashboard/businesses/invite/${created.id}`);
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
    .update({
      invited_user: user.id,
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
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

export async function deleteBusiness(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("business_id") ?? "").trim();
  if (!id) throw new Error("Missing business id");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // Verify ownership
  const { data: biz, error: bizErr } = await supabase
    .from("business")
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle();

  if (bizErr) throw new Error(bizErr.message);
  if (!biz) throw new Error("Business not found.");
  if (biz.owner_id !== user.id) {
    throw new Error("Only the owner can delete this business.");
  }

  // Delete (cascades will clean up related rows)
  const { error: delErr } = await supabase
    .from("business")
    .delete()
    .eq("id", id);
  if (delErr) throw new Error(delErr.message);

  revalidatePath("/dashboard/businesses");
  redirect("/dashboard/businesses");
}

