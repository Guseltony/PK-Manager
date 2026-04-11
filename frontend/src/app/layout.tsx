import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-surface-base text-text-main min-h-screen selection:bg-brand-primary/30`}
      >
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}