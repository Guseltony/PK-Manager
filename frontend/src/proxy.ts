// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const access = req.cookies.get("accessToken")?.value;
  const refresh = req.cookies.get("refreshToken")?.value;

  const path = req.nextUrl.pathname;

  console.log("running midleware");

  // Avoid loops
  if (path.startsWith("/api/refresh") || path.startsWith("/sign-in")) {
    return NextResponse.next();
  }

  // Access expired but refresh exists → refresh flow
  if (!access && refresh) {
    const url = new URL("/api/refresh", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // No auth at all → login
  if (!access && !refresh) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/note/:path*",
    "/tags/:path*",
    "/archive/:path*",
  ],
};
