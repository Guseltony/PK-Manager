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

// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(req: NextRequest) {
//   const access = req.cookies.get("accessToken")?.value;
//   const refresh = req.cookies.get("refreshToken")?.value;

//   // 1. No tokens → block immediately
//   if (!access && !refresh) {
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }

//   // 2. Access token valid → allow request
//   if (access && !isExpired(access)) {
//     return NextResponse.next();
//   }

//   // 3. Access expired but refresh exists → rotate
//   if (refresh) {
//     const res = await fetch(`${process.env.BACKEND}/auth/refresh`, {
//       headers: {
//         cookie: `refreshToken=${refresh}`,
//       },
//     });

//     if (!res.ok) {
//       return NextResponse.redirect(new URL("/sign-in", req.url));
//     }

//     const next = NextResponse.next();

//     // backend sets cookies → forward them
//     res.headers
//       .getSetCookie()
//       ?.forEach((c) => next.headers.append("set-cookie", c));

//     return next;
//   }

//   // fallback
//   return NextResponse.redirect(new URL("/sign-in", req.url));
// }
