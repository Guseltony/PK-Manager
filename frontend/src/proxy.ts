import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
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
    !refresh &&
    path !== "/" &&
    path !== "/sign-in" &&
    !path.startsWith("/api/") &&
    !path.includes(".") 
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
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
