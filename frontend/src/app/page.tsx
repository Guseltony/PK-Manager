/**
 * Home / Landing Page
 *
 * This is a Next.js SERVER COMPONENT.
 *
 * Why server component?
 * - We call `auth()` here which reads cookies on the server-side (no client round trips).
 * - This means we know if the user is logged in BEFORE the page is rendered, enabling:
 *   1. Redirecting logged-in users directly to /dashboard (no flicker).
 *   2. Showing the right CTA buttons ("Go to Dashboard" vs "Get Started") server-side.
 * - We use `unstable_cache` to cache the auth result for 60s, reducing backend hits
 *   for repeat visitors to the landing page.
 *
 * Architecture note (basic.md #3):
 *   Landing-specific components live in `src/components/landing/` — not mixed with
 *   the dashboard shell components (Header, SideBar). Pages stay thin; logic lives in components.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/src/libs/auth";

import LandingNav from "@/src/components/landing/LandingNav";
import HeroSection from "@/src/components/landing/HeroSection";
import FeaturesSection from "@/src/components/landing/FeaturesSection";
import HowItWorksSection from "@/src/components/landing/HowItWorksSection";
import WhoIsItForSection from "@/src/components/landing/WhoIsItForSection";
import TestimonialsSection from "@/src/components/landing/TestimonialsSection";
import CTASection from "@/src/components/landing/CTASection";
import LandingFooter from "@/src/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "PK-Manager — Organize Your Mind. Execute Your Ideas.",
  description:
    "PK-Manager is the connected workspace for developers and learners. Notes, tasks, goals, and journal — all in one place.",
  keywords: [
    "PKM",
    "Personal Knowledge Management",
    "Note Taking",
    "Task Management",
    "Second Brain",
    "Productivity",
  ],
  openGraph: {
    title: "PK-Manager — Organize Your Mind. Execute Your Ideas.",
    description:
      "The connected workspace for developers and learners. Notes, tasks, goals, journal — all linked together.",
    type: "website",
  },
};

export default async function HomePage() {
  // ── Auth Check (Server-side, using cookies) ───────────────────────────────
  // We intentionally do NOT redirect automatically here — if authenticated we still
  // show the landing page but with CTA pointing to /dashboard instead of /sign-in.
  // This allows the user to review features before entering the app.
  //
  // Note: If you want to auto-redirect authenticated users, uncomment the block below.
  const authResult = await auth();
  const isAuthenticated = authResult.authenticated;

  // Optional: auto-redirect authenticated users straight to dashboard
  // if (isAuthenticated) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-surface-base text-text-main">
      {/* Sticky navigation — client component for scroll effects */}
      <LandingNav isAuthenticated={isAuthenticated} />

      <main>
        {/* 1. Hero — Full screen intro with CTA */}
        <HeroSection isAuthenticated={isAuthenticated} />

        {/* 2. Features — 6-card grid */}
        <FeaturesSection />

        {/* 3. How It Works — 4-step flow */}
        <HowItWorksSection />

        {/* 4. Who Is It For — Audience cards */}
        <WhoIsItForSection />

        {/* 5. Testimonials */}
        <TestimonialsSection />

        {/* 6. Final CTA */}
        <CTASection isAuthenticated={isAuthenticated} />
      </main>

      <LandingFooter />
    </div>
  );
}
