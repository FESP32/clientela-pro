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

export async function logout() {
  const supabase = await createClient();
  // revokes session & clears cookies
  await supabase.auth.signOut();
  // redirect after logout
  redirect("/login");
}


