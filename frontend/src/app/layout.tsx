import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PK-Manager | Personal Knowledge & Learning System",
  description: "Capture, organize, and connect your knowledge. The ultimate PKM system for developers and learners.",
  keywords: ["PKM", "Personal Knowledge Management", "Note taking", "Task tracking", "Learning", "SaaS"],
  authors: [{ name: "Gusel-OS Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-surface-base text-text-main min-h-screen selection:bg-brand-primary/30`}
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
