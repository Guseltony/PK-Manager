import { BACKEND_URL } from "../constants/constants";

const PROXY_URL = process.env.NODE_ENV === "development" && typeof window !== "undefined" 
  ? "/local-api" 
  : BACKEND_URL;

type ApiOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
};

let refreshPromise: Promise<unknown> | null = null;

const apiFetch = async (url: string, options: ApiOptions = {}) => {
  let fullUrl = url.startsWith("http") ? url : (url.startsWith("/") ? `${PROXY_URL}${url}` : `${PROXY_URL}/${url}`);

  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  } as Record<string, string>;

  if (typeof window !== "undefined") {
    let csrfToken = localStorage.getItem("csrf-token");
    
    // Fallback: extract from document.cookie
    if (!csrfToken) {
      const match = document.cookie.match(new RegExp('(^| )csrf=([^;]+)'));
      if (match) csrfToken = match[2];
    }

    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
    }
  }

  const response = await fetch(fullUrl, {
    credentials: "include",
    ...options,
    headers,
  });

  if ((response.status === 401 || response.status === 403) && !options._retry) {
    try {
      // Singleton refresh logic
      if (!refreshPromise) {
        refreshPromise = fetch(`${PROXY_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }).then(async (res) => {
          const data = await res.json().catch(() => ({}));
          const csrfToken = data?.data?.csrfToken || data?.csrfToken;
          if (csrfToken && typeof window !== "undefined") {
            localStorage.setItem("csrf-token", csrfToken);
          }
          if (!res.ok) throw new Error("Refresh failed");
          return data;
        }).finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;
      return apiFetch(url, { ...options, _retry: true });
    } catch (e) {
      // Refresh failed, let the caller handle it (e.g. redirect to login)
      throw e;
    }
  }

  const data = await response.json();
  if (!response.ok) {
    const resolvedMessage =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      "API Error";
    const error = new Error(resolvedMessage) as Error & {
      response?: { data: unknown; status: number };
    };
    error.response = { data, status: response.status };
    throw error;
  }

  return { data };
};

const api = {
  get: <T>(url: string, config?: ApiOptions) =>
    apiFetch(url, { ...config, method: "GET" }) as Promise<{ data: T }>,
  post: <T>(url: string, data?: unknown, config?: ApiOptions) =>
    apiFetch(url, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    }) as Promise<{ data: T }>,
  put: <T>(url: string, data?: unknown, config?: ApiOptions) =>
    apiFetch(url, {
      ...config,
      method: "PUT",
      body: JSON.stringify(data),
    }) as Promise<{ data: T }>,
  delete: <T>(url: string, config?: ApiOptions) =>
    apiFetch(url, { ...config, method: "DELETE" }) as Promise<{ data: T }>,
  patch: <T>(url: string, data?: unknown, config?: ApiOptions) =>
    apiFetch(url, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    }) as Promise<{ data: T }>,
  request: <T>(config: ApiOptions & { url: string }) =>
    apiFetch(config.url, config) as Promise<{ data: T }>,
};

export const setManualCsrfToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("csrf-token", token);
  }
};

export const logout = async () => {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("csrf-token");
      // Clear any other auth related items if any
    }
  }
};

export default api;
