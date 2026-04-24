import { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
} as const;

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
} as const;

export async function POST(req: Request) {
  const formData = await req.formData();
  const refreshToken = formData.get("refreshToken")?.toString() ?? "";
  const accessToken = formData.get("accessToken")?.toString() ?? "";
  const csrfToken = formData.get("csrfToken")?.toString() ?? "";
  const next = formData.get("next")?.toString() || "/dashboard";

  if (!refreshToken || !accessToken || !csrfToken) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const res = NextResponse.redirect(new URL(next, req.url));

  res.cookies.set("refreshToken", refreshToken, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
  res.cookies.set("accessToken", accessToken, {
    ...authCookieOptions,
    maxAge: 15 * 60,
  });
  res.cookies.set("csrf", csrfToken, {
    ...csrfCookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}