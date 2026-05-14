"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/src/constants/constants";
import { setManualCsrfToken } from "@/src/libs/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("Missing authorization code or state.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const storedState = localStorage.getItem("oauth_state");
        localStorage.removeItem("oauth_state");

        const res = await fetch(`${BACKEND_URL}/auth/google/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            code,
            state,
            storedState,
            redirectUri: `${window.location.origin}/auth/callback`,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to exchange code");
        }

        const { data } = await res.json();
        if (data.csrfToken) {
          setManualCsrfToken(data.csrfToken);
        }

        router.push("/dashboard");
      } catch (err: any) {
        console.error("Auth exchange error:", err);
        setError(err.message || "An error occurred during sign-in.");
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-surface-soft p-8 text-center shadow-2xl">
          <h1 className="mb-4 text-xl font-bold text-red-400">Authentication Failed</h1>
          <p className="mb-6 text-text-muted">{error}</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-xl bg-brand-primary py-3 font-bold text-white transition-all hover:bg-brand-primary/90"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        <p className="text-lg font-medium text-text-main">Finalizing sign-in...</p>
      </div>
    </div>
  );
}
