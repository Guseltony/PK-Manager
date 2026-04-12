import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${plusJakarta.variable} font-sans antialiased bg-surface-base text-text-main min-h-screen selection:bg-brand-primary/30`}
      >
        <Providers>{children}</Providers>
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </body>
    </html>
  );
}