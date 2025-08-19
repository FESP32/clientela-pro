"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import config from "@/config";

// export const signInWithGoogle = async (
//   event: React.FormEvent<HTMLFormElement>
// ) => {
//   event.preventDefault();
//   const formData = new FormData(event.currentTarget);
//   const supabase = await createClient();
//   const priceId = formData.get("priceId") as string;
//   try {
//     const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;
//     const { error: signInError } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${redirectTo}?priceId=${encodeURIComponent(
//           priceId || ""
//         )}&redirect=/test`,
//       },
//     });
//     if (signInError) {
//       return { error: "Failed to sign in with Google. Please try again." };
//     }
//   } catch (error) {
//     return { error: "Failed to sign in with Google. Please try again." };
//   }
// };

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // after Google consent, Supabase will bounce you back here:
      redirectTo: `${config.domainName}/auth/callback`,
    },
  });
  if (error) {
    // you can render this error in your UI if you like
    throw new Error(`OAuth error: ${error.message}`);
  }
  // this sends a 3xx redirect to the browser
  if (data.url) redirect(data.url);
}

export async function signInWithFacebook() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      // after Facebook consent, Supabase will bounce you back here:
      redirectTo: `${config.domainName}/auth/callback`,
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
