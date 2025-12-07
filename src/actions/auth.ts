"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signInWithGoogle(next?: string) {
  const supabase = await createClient();

  // Only allow same-origin relative paths like "/foo" (avoid open redirects)
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;

  const base = process.env.NEXT_PUBLIC_BASE_URL!;
  const callback = new URL("/auth/callback", base);
  if (safeNext) callback.searchParams.set("next", safeNext);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
    },
  });

  if (error) {
    throw new Error(`OAuth error: ${error.message}`);
  }

  if (data.url) redirect(data.url);
}

export async function signInWithFacebook() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      // after Facebook consent, Supabase will bounce you back here:
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      // request basic profile + email (adjust if you need fewer/more)
      scopes: "public_profile,email",
    },
  });

  if (error) {
    throw new Error(`OAuth error: ${error.message}`);
  }

  if (data?.url) {
    redirect(data.url);
  }
}

export async function sendMagicLink(
  prevState: { ok?: boolean; error?: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") || "").trim();
  const next = String(formData.get("next") || ""); // optional

  if (!email) return { ok: false, error: "Please enter your email." };

  const supabase = await createClient();

  // Build the redirect target for the link the user will click in the email
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const redirectTo = `${base}/auth/callback${
    next ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // If you enable Captcha in Supabase, include captchaToken here
      emailRedirectTo: redirectTo,
      shouldCreateUser: true, // set false if you want login-only
    },
  });

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function logout() {
  const supabase = await createClient();
  // revokes session & clears cookies
  await supabase.auth.signOut();
  // redirect after logout
  redirect("/login");
}


