"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGate({
  authenticated,
  children,
}: {
  authenticated: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  console.log("refreshing from authGate");

  useEffect(() => {
    if (authenticated) return;

    console.log("starting refreshing");

    async function refresh() {
      const res = await fetch("/api/refresh", {
        method: "POST",
        credentials: "include",
      });

      console.log("resss:", res);

      if (res.ok) {
        router.refresh(); // 🔁 retry navigation
      } else {
        router.push("/sign-in");
      }
    }

    refresh();
  }, [authenticated, router]);

  // ⛔ Block rendering while unauthenticated (during refresh attempt)
  if (!authenticated) return null;

  return <>{children}</>;
}
