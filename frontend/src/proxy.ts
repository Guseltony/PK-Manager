import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const access = req.cookies.get("accessToken")?.value;
  const refresh = req.cookies.get("refreshToken")?.value;

  const path = req.nextUrl.pathname;
  const isAuthenticated = !!(access || refresh);

  // console.log("running middleware on:", path, "auth:", isAuthenticated);

  // 1. If authenticated and at landing or sign-in, go to dashboard
  if (isAuthenticated && (path === "/" || path === "/sign-in")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 2. If unauthenticated and trying to access protected routes, go to home
  if (
    !isAuthenticated &&
    path !== "/" &&
    path !== "/sign-in" &&
    !path.startsWith("/api/") &&
    !path.includes(".") // avoid matching static files
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // 3. Handle refresh logic if access is missing but refresh exists
  // FOR PAGE NAVIGATION: Redirect to refresh route
  if (
    !access &&
    refresh &&
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
