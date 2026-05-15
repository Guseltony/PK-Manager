"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/libs/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Small delay to ensure cookies set by the OAuth exchange
      // have been registered in the browser before we call /user/get.
      await new Promise((r) => setTimeout(r, 150));
      try {
        const res = await api.get("/user/get");
        if (!res.data) {
          router.push("/sign-in");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/sign-in");
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-base">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
