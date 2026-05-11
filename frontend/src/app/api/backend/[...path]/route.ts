import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/src/constants/constants";
import { getCookies } from "@/src/utils/getCookie";

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const pathParts = (await params).path;
  const path = pathParts.join("/");
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ""}`;

  const cookieHeader = await getCookies();
  const csrfToken = req.headers.get("x-csrf-token");

  try {
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
        "x-csrf-token": csrfToken ?? "",
      },
      body,
      cache: "no-store",
    });

    // Mirror the backend response
    const data = await backendRes.json().catch(() => ({}));
    const res = NextResponse.json(data, { status: backendRes.status });

    // Forward any Set-Cookie headers (for token rotation)
    const mirroredCookies = backendRes.headers.getSetCookie?.() ?? [];
    mirroredCookies.forEach((cookie) => res.headers.append("set-cookie", cookie));

    return res;
  } catch (error) {
    console.error(`Proxy error for ${path}:`, error);
    return NextResponse.json({ error: "Backend proxy failed" }, { status: 502 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
