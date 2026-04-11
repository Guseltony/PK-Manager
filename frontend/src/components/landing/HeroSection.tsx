"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiZap } from "react-icons/fi";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export default function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 text-center">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-125 w-175 -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-64 w-64 rounded-full bg-brand-secondary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-40 h-48 w-48 rounded-full bg-brand-accent/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-4xl"
      >
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5">
          <FiZap size={12} className="text-brand-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
            Your Second Brain, Rebuilt
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-display font-extrabold leading-[1.1] tracking-tight text-text-main md:text-7xl">
          Organize Your Mind.{" "}
          <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Execute Your Ideas.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text-muted md:text-xl">
          PK-Manager is the connected workspace where your notes, tasks, goals,
          and journal live together — helping you think clearly and move faster.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={isAuthenticated ? "/dashboard" : "/sign-in"}
            className="group flex items-center gap-2 rounded-xl bg-brand-primary px-8 py-4 text-base font-bold text-white shadow-2xl shadow-brand-primary/30 transition-all hover:bg-brand-primary/90 hover:shadow-brand-primary/50 hover:gap-3"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start for Free"}
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
          {!isAuthenticated && (
            <a
              href="#features"
              className="rounded-xl border border-white/10 px-8 py-4 text-base font-semibold text-text-muted transition-all hover:border-white/20 hover:bg-white/5 hover:text-text-main"
            >
              See Features
            </a>
          )}
        </div>

        {/* Social proof */}
        <p className="mt-10 text-sm text-text-muted/60">
          Built for developers, learners & curious minds 🧠
        </p>
      </motion.div>

      {/* App Preview Mock */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3 }}
        className="relative z-10 mt-20 w-full max-w-5xl"
      >
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-soft shadow-2xl shadow-black/50">
          {/* Mock window controls */}
          <div className="flex items-center gap-2 border-b border-white/5 bg-surface-base px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-text-muted/50">
              pkmanager.app — Dashboard
            </span>
          </div>

          {/* Mock UI */}
          <div className="flex h-80 gap-0">
            {/* Sidebar mock */}
            <div className="hidden w-48 flex-col gap-3 border-r border-white/5 bg-surface-soft p-4 sm:flex">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-brand-primary/30" />
                <div className="h-3 w-20 rounded bg-white/5" />
              </div>
              {["Dashboard", "Notes", "Tasks", "Goals", "Journal"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                  >
                    <div
                      className={`h-3.5 w-3.5 rounded ${item === "Notes" ? "bg-brand-primary/50" : "bg-white/10"}`}
                    />
                    <div
                      className={`h-2.5 rounded ${item === "Notes" ? "w-10 bg-brand-primary/50" : "w-12 bg-white/10"}`}
                    />
                  </div>
                ),
              )}
            </div>

            {/* Main content mock */}
            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 rounded-lg bg-white/10" />
                <div className="h-8 w-24 rounded-xl bg-brand-primary/20" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    color: "bg-brand-primary/20",
                    w: "w-24",
                    label: "12 Notes",
                  },
                  {
                    color: "bg-brand-secondary/20",
                    w: "w-20",
                    label: "5 Tasks",
                  },
                  { color: "bg-green-500/20", w: "w-20", label: "3 Goals" },
                ].map(({ color, label }) => (
                  <div
                    key={label}
                    className={`rounded-xl border border-white/5 p-4 ${color}`}
                  >
                    <div className="mb-2 h-4 w-16 rounded bg-white/10" />
                    <div className="text-xs font-semibold text-text-muted">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              {/* Note cards mock */}
              <div className="flex flex-col gap-2">
                {[
                  "Python Lists & Algorithms",
                  "System Design Notes",
                  "Goal: Become a Backend Dev",
                ].map((note) => (
                  <div
                    key={note}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-base px-4 py-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-brand-primary/60" />
                    <span className="text-xs text-text-muted">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Glow under preview */}
        <div className="mx-auto mt-0 h-16 w-2/3 rounded-full bg-brand-primary/20 blur-3xl" />
      </motion.div>
    </section>
  );
}
