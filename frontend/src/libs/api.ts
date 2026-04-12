import axios from "axios";
import { BACKEND_URL } from "../constants/constants";

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  xsrfCookieName: "csrf",
  xsrfHeaderName: "x-csrf-token",
});

// Interceptor to handle CSRF tokens manually if cookies are blocked
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const manualToken = localStorage.getItem("csrf-token");
    if (manualToken) {
      config.headers["x-csrf-token"] = manualToken;
    }
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Use the base axios instance to avoid recursive loops
        const { data } = await axios.post(`${BACKEND_URL}/auth/refresh`, {}, { withCredentials: true });
        
        if (data.csrfToken) {
          setManualCsrfToken(data.csrfToken);
        }
        
        // Re-construct a CLEAN request to avoid adapterFn/internal state errors
        const retryConfig = {
          url: originalRequest.url,
          method: originalRequest.method,
          data: originalRequest.data,
          params: originalRequest.params,
          headers: {
            ...originalRequest.headers,
            "x-csrf-token": localStorage.getItem("csrf-token") || "",
          },
        };
        
        return api(retryConfig);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Helper to store the token when received in JSON
export const setManualCsrfToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("csrf-token", token);
  }
};

export default api;
