import { BACKEND_URL } from "../constants/constants";

// Robust fetch-based API client to avoid Axios 'adapterFn' errors in Next.js 16+
const apiFetch = async (url: string, options: RequestInit & { _retry?: boolean } = {}) => {
  const fullUrl = url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  } as Record<string, string>;

  if (typeof window !== "undefined") {
    const manualToken = localStorage.getItem("csrf-token");
    if (manualToken) {
      headers["x-csrf-token"] = manualToken;
    }
  }

  const response = await fetch(fullUrl, {
    credentials: "include",
    ...options,
    headers,
  });

  // Handle 401 and Refresh logic natively
  if (response.status === 401 && !options._retry) {
    try {
      const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      
      const refreshData = await refreshRes.json();
      if (refreshData.csrfToken) {
        localStorage.setItem("csrf-token", refreshData.csrfToken);
      }

      // Retry once
      return apiFetch(url, { ...options, _retry: true });
    } catch (e) {
      if (typeof window !== "undefined") window.location.href = "/sign-in";
      throw e;
    }
  }

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "API Error") as Error & { response?: { data: unknown; status: number } };
    error.response = { data, status: response.status };
    throw error;
  }

  return { data };
};

const api = {
  get: <T>(url: string, config?: RequestInit) => apiFetch(url, { ...config, method: "GET" }) as Promise<{ data: T }>,
  post: <T>(url: string, data?: unknown, config?: RequestInit) => apiFetch(url, { ...config, method: "POST", body: JSON.stringify(data) }) as Promise<{ data: T }>,
  put: <T>(url: string, data?: unknown, config?: RequestInit) => apiFetch(url, { ...config, method: "PUT", body: JSON.stringify(data) }) as Promise<{ data: T }>,
  delete: <T>(url: string, config?: RequestInit) => apiFetch(url, { ...config, method: "DELETE" }) as Promise<{ data: T }>,
  request: <T>(config: RequestInit & { url: string }) => apiFetch(config.url, config as RequestInit) as Promise<{ data: T }>,
};

export const setManualCsrfToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("csrf-token", token);
  }
};

export default api;
