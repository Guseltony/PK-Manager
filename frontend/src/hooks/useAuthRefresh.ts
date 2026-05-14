// hooks/useAuthRefresh.ts
"use client";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../constants/constants";

export function useAuthRefresh() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Refresh failed");
      } catch (err) {
        console.error("Refresh token failed", err);
        // optionally redirect to login page here
      } finally {
        setDone(true);
      }
    };

    refresh();
  }, []);

  return done;
}
