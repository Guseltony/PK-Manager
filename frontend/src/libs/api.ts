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
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest) originalRequest._retry = true;
      try {
        // Use a clean axios instance for refresh to avoid interceptor loops
        const { data } = await axios.post(`${BACKEND_URL}/auth/refresh`, {}, { withCredentials: true });
        
        if (data.csrfToken) {
          setManualCsrfToken(data.csrfToken);
        }
        
        const token = localStorage.getItem("csrf-token") || "";
        
        // Re-issue the original request using the axios base instance for maximum stability
        return axios({
          method: originalRequest.method,
          url: originalRequest.baseURL ? `${originalRequest.baseURL}${originalRequest.url}` : originalRequest.url,
          data: originalRequest.data,
          params: originalRequest.params,
          headers: {
            ...originalRequest.headers,
            "x-csrf-token": token,
          },
          withCredentials: true,
        });
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
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
