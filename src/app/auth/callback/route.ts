// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Only allow relative paths like "/something" (avoid open redirects)
  const nextParam = searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Code exchange error:", error);
      return NextResponse.redirect(new URL("/error", request.url));
    }

    // Redirect to the validated next path (or /dashboard)
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  return NextResponse.redirect(new URL("/error", request.url));
}
