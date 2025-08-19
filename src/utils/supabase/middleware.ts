// middleware/update-session.ts (or wherever you keep this)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: keep this call after client creation and before any custom logic.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Routes config
  const protectedRoutes = [
    "/dashboard",
    "/services/referral",
    "/settings",
    "/admin",
  ];
  const authRoutes = ["/login", "/signup", "/auth"];

  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute =
    authRoutes.some((route) => pathname.startsWith(route)) &&
    !pathname.startsWith("/auth/callback"); // allow callback to pass

  const isDashboardRoute = pathname.startsWith("/dashboard");

  // If user is not logged in and trying to access protected route -> go to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Determine user_type (defaults to 'customer' if no profile row yet)
  let userType: "merchant" | "customer" = "customer";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("user_id", user.id)
      .single();

    if (profile?.user_type === "merchant") {
      userType = "merchant";
    }
  }

  // Customers cannot access /dashboard/**
  if (user && userType === "customer" && isDashboardRoute) {
    return NextResponse.redirect(new URL("/services", request.url));
  }

  // If logged in and visiting auth pages, send them to the right home
  if (user && isAuthRoute) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");

    // If there was an intended destination:
    if (redirectTo && redirectTo.startsWith("/")) {
      // But block customers from any dashboard redirect target
      if (userType === "customer" && redirectTo.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/services", request.url));
      }
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Otherwise send to default home per user_type
    const home = userType === "merchant" ? "/dashboard" : "/services";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Return the supabaseResponse to keep cookies/session in sync
  return supabaseResponse;
}
