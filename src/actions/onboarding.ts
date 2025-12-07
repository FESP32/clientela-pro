"use server"

import { cookies } from "next/headers";

/** Read once on the server to decide whether to render onboarding */
export async function hasOnboardingDone(cookieName = "onboarding_done_v1") {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value === "true";
}

export async function setOnboardingCookie(
  cookieName = "onboarding_done_v1",
  maxAgeSeconds = 60 * 60 * 24 * 365 // 1 year
) {
  (await cookies()).set({
    name: cookieName,
    value: "true",
    httpOnly: true, // server-only; safer
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}