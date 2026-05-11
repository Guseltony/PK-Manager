/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import { Providers } from "./providers";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "PK-Manager | Personal Knowledge & Learning System",
  description:
    "Capture, organize, and connect your knowledge. The ultimate PKM system for developers and learners.",
  keywords: [
    "PKM",
    "Personal Knowledge Management",
    "Note taking",
    "Task tracking",
    "Learning",
    "SaaS",
  ],
  authors: [{ name: "Gusel-OS Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PKM",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-surface-base text-text-main min-h-dvh selection:bg-brand-primary/30 overscroll-none">
        <Providers>{children}</Providers>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
