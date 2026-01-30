import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

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
