"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { setManualCsrfToken } from "../libs/api";

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
      try {
        const response = await fetch("/api/refresh", {
          method: "POST",
          credentials: "include",
        });

        const data = await response.json().catch(() => ({}));
        const csrfToken = data?.csrfToken || data?.data?.csrfToken;

        if (response.ok && csrfToken) {
          setManualCsrfToken(csrfToken);
        }
      } catch (err) {
        console.warn("Auth bootstrap failed (user likely not logged in)");
        console.error(err);
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