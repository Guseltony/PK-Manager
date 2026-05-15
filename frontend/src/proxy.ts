import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // Use a fallback so it doesn't crash if NEXT_PUBLIC_BACKEND_URL isn't fully loaded
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Access cookies
  const access = req.cookies.get("accessToken")?.value;
  const refresh = req.cookies.get("refreshToken")?.value;
  const csrf = req.cookies.get("csrf")?.value;

  const path = req.nextUrl.pathname;

  const isFullyAuthenticated = !!access;
  const hasRefreshOnly = !access && !!refresh;

  // Let's create the default response we plan to send
  let response = NextResponse.next();

  // 1. Check if we need to refresh the token quietly before continuing
  if (hasRefreshOnly) {
    console.log("[Middleware] No access token found, but refresh token exists. Attempting refresh...");
    
    // Attempt to refresh the token against the backend
    try {
      const allCookies = req.cookies.getAll().map(c => `${c.name}=${c.value}`).join("; ");
      
      const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "x-csrf-token": csrf ?? "",
          "Cookie": allCookies,
        },
      });

      if (refreshRes.ok) {
        console.log("[Middleware] Refresh successful. Setting new cookies.");
        
        // Grab the set-cookie headers from the backend response
        const setCookieHeaders = refreshRes.headers.getSetCookie();
        
        // Add them to the response going to the browser
        for (const cookieStr of setCookieHeaders) {
          response.headers.append("Set-Cookie", cookieStr);
        }

        // We also need to clone the request headers and append the new cookies 
        // so that the internal Next.js server components (like auth.ts) can see them immediately!
        const requestHeaders = new Headers(req.headers);
        const updatedCookies = [...setCookieHeaders.map(c => c.split(";")[0]), allCookies].join("; ");
        requestHeaders.set("cookie", updatedCookies);
        
        // Re-create the response to pass the updated request headers down the chain
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        
        // We are now fully authenticated for this request!
        return response;
      } else {
        console.log("[Middleware] Refresh failed. Proceeding as unauthenticated.");
        // If refresh failed, they are unauthenticated. We should delete the bad tokens and redirect.
        response = NextResponse.redirect(new URL("/sign-in", req.url));
        response.cookies.delete("refreshToken");
        response.cookies.delete("accessToken");
        return response;
      }
    } catch (e) {
      console.log("[Middleware] Refresh fetch error:", e);
    }
  }

  // 2. If fully authenticated and trying to access auth pages, send to dashboard
  if (isFullyAuthenticated && (path === "/sign-in" || path === "/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Protect protected routes if completely unauthenticated
  if (
    !isFullyAuthenticated &&
    !hasRefreshOnly &&
    path !== "/" &&
    path !== "/sign-in" &&
    path !== "/onboarding" &&
    !path.startsWith("/auth/") &&   // Allow /auth/callback and all OAuth routes
    !path.startsWith("/api/") &&
    !path.includes(".")
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};
