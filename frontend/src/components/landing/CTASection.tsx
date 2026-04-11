"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiZap } from "react-icons/fi";

interface CTASectionProps {
  isAuthenticated: boolean;
}

export default function CTASection({ isAuthenticated }: CTASectionProps) {
  return (
    <section className="relative py-32 px-6">
      {/* Background glow */}
      <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-brand-primary/20 bg-linear-to-br from-surface-soft via-surface-soft to-brand-primary/5 p-16 text-center shadow-2xl shadow-black/30"
      >
        {/* Corner glows */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-brand-secondary/10 blur-3xl" />

        <div className="relative">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary shadow-2xl shadow-brand-primary/40">
              <FiZap size={28} className="text-white" />
            </div>
          </div>

          <h2 className="mb-4 text-4xl font-display font-extrabold tracking-tight text-text-main md:text-5xl">
            Start Building Your{" "}
            <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Second Brain
            </span>
          </h2>

          <p className="mx-auto mb-10 max-w-xl text-lg text-text-muted">
            Join developers, students, and creators who use PK-Manager to
            capture knowledge and turn it into results.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={isAuthenticated ? "/dashboard" : "/sign-in"}
              className="group flex items-center gap-2 rounded-xl bg-brand-primary px-10 py-4 text-base font-bold text-white shadow-2xl shadow-brand-primary/30 transition-all hover:bg-brand-primary/90 hover:gap-3 hover:shadow-brand-primary/50"
            >
              {isAuthenticated ? "Open Dashboard" : "Get Started — It's Free"}
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="mt-6 text-xs text-text-muted/50">
            No credit card required · Always free to start
          </p>
        </div>
      </motion.div>
    </section>
  );
}
