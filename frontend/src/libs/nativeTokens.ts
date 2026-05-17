import { Capacitor } from "@capacitor/core";

const ACCESS_KEY = "pkm_access_token";
const REFRESH_KEY = "pkm_refresh_token";

export function isNativeRuntime() {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) {
  if (typeof window === "undefined") return;
  if (tokens.accessToken) window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  if (tokens.refreshToken) window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}
