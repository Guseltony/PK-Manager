import { BACKEND_URL } from "../constants/constants";

type ApiOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
};

const apiFetch = async (url: string, options: ApiOptions = {}) => {
  let fullUrl = "";
  
  if (typeof window !== "undefined") {
    // In the browser, we use our local Next.js proxy to avoid cross-domain cookie issues
    fullUrl = url.startsWith("/") ? `/api/backend${url}` : `/api/backend/${url}`;
  } else {
    // On the server, we can call the backend directly
    fullUrl = url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
  }

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

  if (response.status === 401 && !options._retry) {
    try {
      const refreshRes = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const refreshData = await refreshRes.json().catch(() => ({}));
      const csrfToken = refreshData?.data?.csrfToken || refreshData?.csrfToken;
      if (csrfToken && typeof window !== "undefined") {
        localStorage.setItem("csrf-token", csrfToken);
      }

      if (!refreshRes.ok) {
        throw new Error("Refresh failed");
      }

      return apiFetch(url, { ...options, _retry: true });
    } catch (e) {
      // Do not force a global redirect here. Let the calling page/hook handle it.
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
  request: <T>(config: ApiOptions & { url: string }) =>
    apiFetch(config.url, config) as Promise<{ data: T }>,
};

export const setManualCsrfToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("csrf-token", token);
  }
};

export default api;