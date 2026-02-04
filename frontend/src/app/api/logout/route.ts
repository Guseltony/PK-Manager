import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/src/constants/constants";
import { cookies } from "next/headers";
import { getCookies } from "@/src/utils/getCookie";
import { getCookie } from "@/src/utils/getCrsf";

export async function POST(req: Request) {
  const allCookies = await getCookies();
  const csrfToken = (await cookies()).get("csrf")?.value;

  const backendRes = await fetch(`${BACKEND_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "x-csrf-token": csrfToken ?? "",
      Cookie: allCookies, // 🔑 forward cookies
    },
    credentials: "include",
  });

  if (!backendRes.ok) {
    const text = await backendRes.text();
    return NextResponse.json(
      { error: text || "Logout failed" },
      { status: backendRes.status },
    );
  }

  const res = NextResponse.json({ success: true });

  // 🔑 forward Set-Cookie (cookie deletion)
  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}
