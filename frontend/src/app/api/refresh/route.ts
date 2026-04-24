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
      cache: "no-store",
    });

    const mirroredCookies = backendRes.headers.getSetCookie?.() ?? [];

    if (!backendRes.ok) {
      if (req.method === "GET") {
        const redirectRes = NextResponse.redirect(new URL("/sign-in", req.url));
        redirectRes.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
        redirectRes.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
        redirectRes.cookies.set("csrf", "", { maxAge: 0, path: "/" });
        return redirectRes;
      }

      const errorBody = await backendRes.json().catch(() => ({ error: "Session expired" }));
      const errorRes = NextResponse.json(errorBody, { status: backendRes.status });
      errorRes.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      errorRes.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      errorRes.cookies.set("csrf", "", { maxAge: 0, path: "/" });
      return errorRes;
    }

    if (req.method === "GET") {
      const next = new URL(req.url).searchParams.get("next") ?? "/dashboard";
      const res = NextResponse.redirect(new URL(next, req.url));
      mirroredCookies.forEach((cookie) => res.headers.append("set-cookie", cookie));
      return res;
    }

    const body = await backendRes.json().catch(() => ({ ok: true }));
    const res = NextResponse.json(body, { status: backendRes.status });
    mirroredCookies.forEach((cookie) => res.headers.append("set-cookie", cookie));
    return res;
  } catch (error) {
    console.error("Refresh route error:", error);

    if (req.method === "GET") {
      const redirectRes = NextResponse.redirect(new URL("/sign-in", req.url));
      redirectRes.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      redirectRes.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      redirectRes.cookies.set("csrf", "", { maxAge: 0, path: "/" });
      return redirectRes;
    }

    const errorRes = NextResponse.json(
      { error: "Unable to refresh session." },
      { status: 500 },
    );
    errorRes.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    errorRes.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    errorRes.cookies.set("csrf", "", { maxAge: 0, path: "/" });
    return errorRes;
  }
}

export const GET = handleRefresh;
export const POST = handleRefresh;