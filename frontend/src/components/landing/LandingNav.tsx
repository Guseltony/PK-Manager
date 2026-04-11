"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiZap, FiMenu, FiX } from "react-icons/fi";

interface LandingNavProps {
  isAuthenticated: boolean;
}

export default function LandingNav({ isAuthenticated }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/5 bg-surface-base/90 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary shadow-lg shadow-brand-primary/30">
            <FiZap className="text-lg text-white" />
          </div>
          <span className="text-lg font-bold text-text-main">
            PK<span className="text-brand-primary">Manager</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {["Features", "How It Works", "Who It's For"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/[^a-z]/g, "-")}`}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text-main"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary/90 hover:shadow-brand-primary/40"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-semibold text-text-muted transition-colors hover:text-text-main"
              >
                Sign In
              </Link>
              <Link
                href="/sign-in"
                className="rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary/90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-white/5 hover:text-text-main md:hidden"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-surface-base/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {["Features", "How It Works", "Who It's For"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/[^a-z]/g, "-")}`}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-text-muted hover:text-text-main"
              >
                {item}
              </a>
            ))}
            <div className="border-t border-white/5 pt-4">
              <Link
                href="/sign-in"
                className="block w-full rounded-xl bg-brand-primary py-3 text-center text-sm font-bold text-white"
              >
                {isAuthenticated ? "Go to Dashboard →" : "Get Started"}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
