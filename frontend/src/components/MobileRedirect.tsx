"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/src/hooks/useIsMobile";

export function MobileRedirect() {
  const router = useRouter();
  const { isNative } = useIsMobile();

  useEffect(() => {
    if (isNative) {
      // Check if user is authenticated (simplified check for redirect)
      const onboardingCompleted = localStorage.getItem("pkm_onboarding_completed");
      
      if (!onboardingCompleted) {
        router.replace("/welcome");
      } else {
        // If onboarding is done, the server-side auth in page.tsx will handle
        // the redirect to dashboard if authenticated.
        // But for mobile, we want to skip the landing page regardless.
        router.replace("/sign-in");
      }
    }
  }, [isNative, router]);

  return null;
}
