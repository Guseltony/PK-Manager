import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/src/constants/constants";

async function handleRefresh(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const csrf = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("csrf="))
    ?.split("=")[1];

  try {
    const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
        "x-csrf-token": csrf ?? "",
      },
      credentials: "include",
    });

    if (!backendRes.ok) {
      // Backend returned 401 — session is dead. Clear all cookies and redirect to sign-in.
      // This breaks the proxy redirect loop by ensuring no stale tokens remain.
      const redirectRes = NextResponse.redirect(new URL("/sign-in", req.url));
      // Expire all auth cookies immediately
      redirectRes.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      redirectRes.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      redirectRes.cookies.set("csrf", "", { maxAge: 0, path: "/" });
      return redirectRes;
    }

    const setCookie = backendRes.headers.get("set-cookie");

    // For GET (Page Navigation): Redirect to next or home
    if (req.method === "GET") {
      const next = new URL(req.url).searchParams.get("next") ?? "/dashboard";
      const res = NextResponse.redirect(new URL(next, req.url));
      if (setCookie) res.headers.set("set-cookie", setCookie);
      return res;
    }

    // For POST (Client-side fetch): Return JSON
    const res = NextResponse.json({ ok: true });
    if (setCookie) res.headers.set("set-cookie", setCookie);
    return res;

  } catch (error) {
    console.error("Refresh route error:", error);
    // Network error — also clear cookies and force sign-in
    const redirectRes = NextResponse.redirect(new URL("/sign-in", req.url));
    redirectRes.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    redirectRes.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    redirectRes.cookies.set("csrf", "", { maxAge: 0, path: "/" });
    return redirectRes;
  }
}

export const GET = handleRefresh;
export const POST = handleRefresh;
