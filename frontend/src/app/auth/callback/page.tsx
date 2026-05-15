"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BACKEND_URL } from "@/src/constants/constants";
import { setManualCsrfToken } from "@/src/libs/api";

import Image from "next/image";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Starting authentication...");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    console.log("[AUTH CALLBACK] code:", code ? "present" : "MISSING");
    console.log("[AUTH CALLBACK] state:", state ? "present" : "MISSING");
    console.log("[AUTH CALLBACK] NODE_ENV:", process.env.NODE_ENV);
    console.log("[AUTH CALLBACK] BACKEND_URL:", BACKEND_URL);

    if (!code || !state) {
      setError("Missing authorization code or state. Google may have rejected the request.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const storedState = localStorage.getItem("oauth_state");
        localStorage.removeItem("oauth_state");

        console.log("[AUTH CALLBACK] storedState from localStorage:", storedState ? "present" : "MISSING/NULL");
        console.log("[AUTH CALLBACK] state match:", state === storedState);

        // Always use /local-api in dev — resolved inside the effect where window is defined
        const isDev = process.env.NODE_ENV === "development";
        const proxyUrl = isDev ? "/local-api" : BACKEND_URL;
        const exchangeUrl = `${proxyUrl}/auth/google/exchange`;

        console.log("[AUTH CALLBACK] isDev:", isDev);
        console.log("[AUTH CALLBACK] Fetching:", exchangeUrl);
        setStatus("Exchanging code with server...");

        const res = await fetch(exchangeUrl, {
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

        console.log("[AUTH CALLBACK] Exchange response status:", res.status);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("[AUTH CALLBACK] Exchange failed:", data);
          throw new Error(data.message || data.error || `Server returned ${res.status}`);
        }

        const body = await res.json();
        console.log("[AUTH CALLBACK] Exchange success. Keys:", Object.keys(body));
        const { data } = body;

        if (data?.csrfToken) {
          setManualCsrfToken(data.csrfToken);
          console.log("[AUTH CALLBACK] CSRF token stored");
        }

        setStatus("Redirecting to dashboard...");
        console.log("[AUTH CALLBACK] Navigating to /dashboard");
        router.push("/dashboard");
      } catch (err) {
        console.error("[AUTH CALLBACK] Error:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-surface-soft p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-text-main">Authentication Failed</h1>
          <p className="mb-4 text-text-muted">{error}</p>
          <p className="mb-8 text-xs text-text-muted/60">Open browser DevTools (F12 → Console) and share the [AUTH CALLBACK] logs for more details.</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="w-full rounded-xl bg-brand-primary py-4 font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base">
      <div className="relative mb-8">
        <div className="absolute inset-0 -m-4 animate-ping rounded-full border-2 border-brand-primary/20 opacity-75" />
        <div className="absolute inset-0 -m-8 animate-pulse rounded-full border-2 border-brand-primary/10 opacity-50" />
        <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-surface-soft p-4 shadow-2xl ring-1 ring-white/10">
           <Image
            src="/icon.png"
            alt="PKM Logo"
            width={96}
            height={96}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-text-main">Authenticating</h2>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-primary [animation-delay:-0.3s]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-primary [animation-delay:-0.15s]" />
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-primary" />
        </div>
        <p className="mt-4 text-sm font-medium text-text-muted">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <div className="h-24 w-24 animate-pulse rounded-2xl bg-surface-soft" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
