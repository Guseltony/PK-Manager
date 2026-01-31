import { cookies } from "next/headers";
import { BACKEND_URL } from "../constants/constants";
import { getCookies } from "../utils/getCookie";
import { getCookie } from "../utils/getCrsf";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  console.log("getting csrf token");
  const allCookies = await getCookies();

  const csrf = allCookies
    .split("; ")
    .find((t) => t.startsWith("csrf"))
    ?.split("=")[1];

  console.log("csrf:", allCookies);
  console.log("real csrf:", csrf);
  if (!csrf) {
    throw new Error("CSRF cookie missing");
  }

  try {
    console.log("calling refresh endpoint");
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "x-csrf-token": csrf,
        Cookie: allCookies,
      },
    });

    console.log("refresh endpoint res:", res);
    console.log("refresh endpoint json) res:", await res.json());

    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const response = await fetch(`${process.env.BACKEND_URL}${input}`, {
    ...init,
    headers: {
      ...init.headers,
      cookie: cookieHeader,
    },
  });

  // Access token still valid
  if (response.status !== 401) {
    return response;
  }

  // Access token expired → refresh flow
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshAccessToken();
  }

  const refreshed = await refreshPromise;
  isRefreshing = false;
  refreshPromise = null;

  if (!refreshed) {
    // Hard logout scenario
    throw new Error("Session expired. Please login again.");
  }

  // Retry original request ONCE
  return fetch(`${API_BASE}${input}`, {
    ...init,
    credentials: "include",
  });
}
