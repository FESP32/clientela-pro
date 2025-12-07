"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getBool } from "@/lib/utils";
import {
  getActiveBusiness,
  getMyOwnedBusinessCount,
  getMyPlan,
} from "@/actions";
import { SubscriptionMetadata } from "@/types/subscription";
import { Resend } from "resend";



export async function createBusiness(formData: FormData) {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/businesses/new");

  const subscriptionPlan = await getMyPlan();
  const subscriptionMetadata: SubscriptionMetadata =
    subscriptionPlan.metadata as SubscriptionMetadata;
  const businessCount = await getMyOwnedBusinessCount();

  if (businessCount >= subscriptionMetadata.max_businesses) {
    console.error("Max business count reached");
    redirect("/dashboard/upgrade");
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = (formData.get("description") as string) || null;
  const website_url = (formData.get("website_url") as string) || null;
  const instagram_url = (formData.get("instagram_url") as string) || null;
  const facebook_url = (formData.get("facebook_url") as string) || null;
  const is_active = getBool(formData, "is_active");

  if (!name) {
    throw new Error("Name is required.");
  }

  // Robustly interpret the uploaded image field
  const rawImage = formData.get("image");
  let imageFile: File | null = null;

  if (rawImage instanceof File) {
    const invalidName = !rawImage.name || rawImage.name === "undefined";
    const looksEmpty = rawImage.size === 0 || invalidName;
    const isImage = rawImage.type?.startsWith("image/");
    if (!looksEmpty && isImage) {
      imageFile = rawImage;
    }
  }

  // Validate only if we actually have a real image file
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
    const ext = (extFromName || extFromType || "jpg")
      .replace("jpeg", "jpg")
      .replace("svg+xml", "svg");

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
      is_active,
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

  const { business: activeBusiness } = await getActiveBusiness();

  if (businessCount === 0 && !activeBusiness && is_active) {
    const { error } = await supabase.from("business_current").upsert(
      {
        user_id: user.id,
        business_id: business.id,
        set_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Unable to set new business as current");
    }
  }

  if (memberErr) {
    throw new Error(memberErr.message);
  }

  // Refresh list + navigate back
  revalidatePath("/dashboard/businesses");
  redirect("/dashboard/businesses?created=1");
}

export async function createBusinessInvite(formData: FormData) {
  const supabase = await createClient();

  const businessId = String(formData.get("business_id") ?? "").trim();
  const role = String(formData.get("role") ?? "member")
    .trim()
    .toLowerCase();
  const email = String(formData.get("email") ?? "").trim();

  if (!businessId) throw new Error("Missing business id");
  if (!["member", "admin"].includes(role)) throw new Error("Invalid role.");
  if (!email) throw new Error("Missing email.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Invalid email.");

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // Fetch business (include name for email)
  const { data: biz, error: bizErr } = await supabase
    .from("business")
    .select("id, owner_id, name")
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

  // Create invite
  const { data: created, error: insErr } = await supabase
    .from("business_invite")
    .insert({
      business_id: businessId,
      invited_by: user.id,
      status: "pending",
      email,
      role,
    })
    .select("id")
    .maybeSingle();

  if (insErr) throw new Error(insErr.message);
  if (!created?.id) throw new Error("Could not create invite.");

  const inviteId = created.id;

  // Build the invite URL (same route you redirect to below)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const inviteUrl = `${baseUrl}/dashboard/businesses/invite/${inviteId}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = "Clientela Pro <onboarding@resend.dev>";

  // Fire-and-forget email (don't block redirect if send fails)
  // You can choose to `await` this; here we do await but swallow errors.
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `You're invited to join ${biz.name ?? "a business"} as ${role}`,
      text: `You've been invited to join ${biz.name ?? "a business"} as ${role}.
        Accept your invite: ${inviteUrl}
        If you weren’t expecting this, you can ignore this email.`,
      html: emailTemplate({
        businessName: biz.name ?? "Our business",
        role,
        inviteUrl,
      }),
    });
  } catch (e) {
    // Intentionally do not fail the action if email sending fails.
    // Optionally log to your observability tool here.
    console.error("Resend email error:", e);
  }

  revalidatePath(`/dashboard/businesses/${businessId}`);
}

function emailTemplate({
  businessName,
  role,
  inviteUrl,
}: {
  businessName: string;
  role: string;
  inviteUrl: string;
}) {
  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#0a0a0a;">
    <h2 style="margin:0 0 12px;">You're invited to join ${escapeHtml(
      businessName
    )}</h2>
    <p style="margin:0 0 16px;">You've been invited to join <strong>${escapeHtml(
      businessName
    )}</strong> as <strong>${escapeHtml(role)}</strong>.</p>
    <p style="margin:0 0 20px;">
      <a href="${inviteUrl}" style="display:inline-block;padding:10px 16px;text-decoration:none;border-radius:10px;border:1px solid #111;">
        Accept your invite
      </a>
    </p>
    <p style="margin:0;color:#555;">If you weren’t expecting this, you can ignore this email.</p>
  </div>
  `;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
