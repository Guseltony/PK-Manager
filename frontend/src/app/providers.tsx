"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { setManualCsrfToken } from "../libs/api";
import { SocketProvider } from "../components/providers/SocketProvider";
import { PushNotificationProvider } from "../components/providers/PushNotificationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    const bootstrapAuth = async () => {
      // 0. Don't run bootstrap on sign-in or auth pages
      if (typeof window !== "undefined" && (
        window.location.pathname.startsWith("/sign-in") || 
        window.location.pathname.startsWith("/api/auth")
      )) {
        return;
      }

      // 1. Check if we already have a CSRF token in cookies
      // This helps avoid a race condition right after login
      const hasCsrf = document.cookie.split("; ").some((c) => c.startsWith("csrf="));
      if (hasCsrf) {
        return;
      }

      try {
        const response = await fetch("/api/refresh", {
          method: "POST",
          // credentials: "include" is important for the browser to send cookies to our API
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const csrfToken = data?.csrfToken || data?.data?.csrfToken;
          if (csrfToken) {
            setManualCsrfToken(csrfToken);
          }

          // If on home page and successfully refreshed, go to dashboard
          if (window.location.pathname === "/") {
            window.location.href = "/dashboard";
          }
        }
      } catch (err) {
        // Silent fail on home page - user just stays logged out
        console.log("No active session found.");
      }
    };

    bootstrapAuth();
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <PushNotificationProvider>{children}</PushNotificationProvider>
        </SocketProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}