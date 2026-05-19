"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/src/hooks/useIsMobile";
import { getAccessToken } from "@/src/libs/nativeTokens";
import { useUser } from "@/src/hooks/useUser";
import LandingNav from "@/src/components/landing/LandingNav";
import HeroSection from "@/src/components/landing/HeroSection";
import FeaturesSection from "@/src/components/landing/FeaturesSection";
import HowItWorksSection from "@/src/components/landing/HowItWorksSection";
import WhoIsItForSection from "@/src/components/landing/WhoIsItForSection";
import TestimonialsSection from "@/src/components/landing/TestimonialsSection";
import CTASection from "@/src/components/landing/CTASection";
import LandingFooter from "@/src/components/landing/LandingFooter";

interface LandingPageClientProps {
  isAuthenticated: boolean;
}

export default function LandingPageClient({
  isAuthenticated,
}: LandingPageClientProps) {
  const router = useRouter();
  const { isNative } = useIsMobile();
  const [shouldRender, setShouldRender] = useState(false);
  const { data: user, isLoading } = useUser();

  useEffect(() => {
    if (isNative) {
      const token = getAccessToken();
      if (token) {
        router.replace("/dashboard");
        return;
      }

      const onboardingCompleted = localStorage.getItem(
        "pkm_onboarding_completed",
      );
      if (!onboardingCompleted) {
        router.replace("/welcome");
      } else {
        router.replace("/sign-in");
      }
      return;
    }

    if (isAuthenticated || user) {
      router.replace("/dashboard");
      return;
    }

    if (!isLoading) {
      setShouldRender(true);
    }
  }, [isNative, router, isAuthenticated, user, isLoading]);

  if (isNative || !shouldRender || isAuthenticated || user) {
    return (
      <div className="fixed inset-0 bg-surface-base flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pkmlogo.png"
          alt="PK-Manager"
          className="w-24 h-24 object-contain animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-text-main">
      <LandingNav isAuthenticated={isAuthenticated} />
      <main>
        <HeroSection isAuthenticated={isAuthenticated} />
        <FeaturesSection />
        <HowItWorksSection />
        <WhoIsItForSection />
        <TestimonialsSection />
        <CTASection isAuthenticated={isAuthenticated} />
      </main>
      <LandingFooter />
    </div>
  );
}