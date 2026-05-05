import { NextResponse } from "next/server";
import crypto from "crypto";

const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

const oauthCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
} as const;

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const mode = requestUrl.searchParams.get("mode") === "signup" ? "signup" : "login";
  const email = requestUrl.searchParams.get("email")?.trim();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return NextResponse.redirect(new URL("/sign-in?error=google_config", req.url));
  }

  const state = crypto.randomUUID();
  const codeVerifier = crypto.randomBytes(64).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const redirectUri = new URL("/api/auth/google/callback", requestUrl.origin).toString();
  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  });

  if (email) {
    params.set("login_hint", email);
  }

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );

  res.cookies.set("oauth_state", state, oauthCookieOptions);
  res.cookies.set("pkce_verifier", codeVerifier, oauthCookieOptions);
  res.cookies.set("oauth_mode", mode, oauthCookieOptions);

  return res;
}
