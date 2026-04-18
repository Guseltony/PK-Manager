"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import api, { setManualCsrfToken } from "../libs/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // Sync CSRF token on boot
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const response = await api.post<{ data?: { csrfToken?: string }; csrfToken?: string }>("/auth/refresh");
        const csrfToken = response.data.data?.csrfToken || response.data.csrfToken;
        if (csrfToken) {
          setManualCsrfToken(csrfToken);
        }
      } catch (err) {
        console.warn("Auth bootstrap failed (user likely not logged in)");
      }
    };
    bootstrapAuth();
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
