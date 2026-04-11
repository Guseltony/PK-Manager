import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const access = req.cookies.get("accessToken")?.value;
  const refresh = req.cookies.get("refreshToken")?.value;

  const path = req.nextUrl.pathname;

  console.log("running proxy middleware on:", path);

  // Avoid loops and bypass landing page
  if (path.startsWith("/api/refresh") || path.startsWith("/sign-in") || path === "/") {
    return NextResponse.next();
  }

  // Access expired but refresh exists → refresh flow
  if (!access && refresh) {
    const url = new URL("/api/refresh", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // No auth at all → login page
  if (!access && !refresh) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/tags/:path*",
    "/archive/:path*",
  ],
};
