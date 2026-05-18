"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/src/libs/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const runningRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    const checkAuth = async () => {
      if (runningRef.current) return;
      runningRef.current = true;

      try {
        if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/welcome")) {
          runningRef.current = false;
          return;
        }

        await api.get("/user/get");
      } catch {
        if (disposed) return;
        router.replace("/sign-in");
      } finally {
        runningRef.current = false;
      }
    };

    void checkAuth();

    const onVisible = () => {
      if (document.visibilityState === "visible") void checkAuth();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, pathname]);

  return <>{children}</>;
}
