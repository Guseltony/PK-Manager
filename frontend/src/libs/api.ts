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
        
        // Update headers on the original request
        if (originalRequest.headers) {
          originalRequest.headers["x-csrf-token"] = localStorage.getItem("csrf-token") || "";
        }
        
        // Retry the original request using the base axios instance
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Optional: Redirect to login if refresh fails
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
