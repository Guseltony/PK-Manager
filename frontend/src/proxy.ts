import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const access = req.cookies.get("accessToken")?.value;
  const refresh = req.cookies.get("refreshToken")?.value;

  const path = req.nextUrl.pathname;

  // A session is only "fully authenticated" when the accessToken exists.
  // A stale refreshToken alone should NOT be treated as authenticated.
  const isFullyAuthenticated = !!access;
  const hasRefreshOnly = !access && !!refresh;

  // 1. If fully authenticated and at landing or sign-in, go to dashboard
  if (isFullyAuthenticated && (path === "/" || path === "/sign-in")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. If NO tokens at all, send to sign-in for protected routes
  if (
    !isFullyAuthenticated &&
    !hasRefreshOnly &&
    path !== "/" &&
    path !== "/sign-in" &&
    !path.startsWith("/api/") &&
    !path.includes(".") // avoid matching static files
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 3. Access token expired but refresh token still present — trigger refresh
  // If /api/refresh then returns a 401, the route handler redirects to /sign-in (not here)
  if (
    hasRefreshOnly &&
    !path.startsWith("/api/") &&
    !path.startsWith("/sign-in") &&
    !path.includes(".")
  ) {
    const url = new URL("/api/refresh", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};
