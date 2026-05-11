import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/src/constants/constants";

const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
} as const;

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: "lax",
  path: "/",
} as const;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const storedState = req.cookies.get("oauth_state")?.value;
  const codeVerifier = req.cookies.get("pkce_verifier")?.value;
  const mode = req.cookies.get("oauth_mode")?.value;

  if (!code || !state || !storedState || !codeVerifier || !mode) {
    const failed = NextResponse.redirect(new URL("/sign-in?error=google_oauth", req.url));
    failed.cookies.set("oauth_state", "", { ...authCookieOptions, maxAge: 0 });
    failed.cookies.set("pkce_verifier", "", { ...authCookieOptions, maxAge: 0 });
    failed.cookies.set("oauth_mode", "", { ...authCookieOptions, maxAge: 0 });
    return failed;
  }

  const redirectUri = new URL("/api/auth/google/callback", url.origin).toString();

  const exchangeRes = await fetch(`${BACKEND_URL}/auth/google/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      state,
      storedState,
      codeVerifier,
      mode,
      redirectUri,
    }),
  });

  const exchangeData = await exchangeRes.json().catch(() => ({}));
  if (!exchangeRes.ok) {
    const failed = NextResponse.redirect(new URL("/sign-in?error=google_exchange", req.url));
    failed.cookies.set("oauth_state", "", { ...authCookieOptions, maxAge: 0 });
    failed.cookies.set("pkce_verifier", "", { ...authCookieOptions, maxAge: 0 });
    failed.cookies.set("oauth_mode", "", { ...authCookieOptions, maxAge: 0 });
    return failed;
  }

  const refreshToken = exchangeData?.data?.refreshToken || "";
  const accessToken = exchangeData?.data?.accessToken || "";
  const csrfToken = exchangeData?.data?.csrfToken || "";
  if (!refreshToken || !accessToken || !csrfToken) {
    return NextResponse.redirect(new URL("/sign-in?error=google_tokens", req.url));
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
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
  res.cookies.set("oauth_state", "", { ...authCookieOptions, maxAge: 0 });
  res.cookies.set("pkce_verifier", "", { ...authCookieOptions, maxAge: 0 });
  res.cookies.set("oauth_mode", "", { ...authCookieOptions, maxAge: 0 });
  return res;
}
