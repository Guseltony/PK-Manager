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
import { auth } from "@/src/libs/auth";

import LandingPageClient from "@/src/components/landing/LandingPageClient";

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
  const authResult = await auth();
  const isAuthenticated = authResult.authenticated;

  return <LandingPageClient isAuthenticated={isAuthenticated} />;
}
