import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const access = req.cookies.get("accessToken")?.value;
  const refresh = req.cookies.get("refreshToken")?.value;

  const path = req.nextUrl.pathname;
  const isAuthenticated = !!(access || refresh);

  console.log("running proxy middleware on:", path, "auth:", isAuthenticated);

  // 1. If authenticated and at landing or sign-in, go to dashboard
  if (isAuthenticated && (path === "/" || path === "/sign-in")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. If unauthenticated and trying to access protected routes, go to home
  // (Assuming protected routes are dashboard, notes, etc. handled by matcher)
  if (
    !isAuthenticated &&
    path !== "/" &&
    path !== "/sign-in" &&
    !path.startsWith("/api/")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. Handle refresh logic if access is missing but refresh exists
  if (
    !access &&
    refresh &&
    !path.startsWith("/api/refresh") &&
    !path.startsWith("/sign-in")
  ) {
    const url = new URL("/api/refresh", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/dashboard/:path*",
    "/notes/:path*",
    "/tags/:path*",
    "/archive/:path*",
  ],
};
