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
        // If it was a GET request (navigation), redirect to sign-in
        if (req.method === "GET") {
            return NextResponse.redirect(new URL("/sign-in", req.url));
        }
        // If it was a POST request (fetch), return 401
        return NextResponse.json({ message: "Refresh failed" }, { status: 401 });
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
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export const GET = handleRefresh;
export const POST = handleRefresh;
