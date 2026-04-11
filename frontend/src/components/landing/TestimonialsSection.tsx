"use client";

import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";

const testimonials = [
  {
    quote:
      "PK-Manager completely changed how I learn and track my progress. Everything is connected — my notes lead to tasks, tasks lead to goals. It just clicks.",
    name: "Adewale Okonkwo",
    role: "Senior Backend Developer",
    initials: "AO",
    color: "bg-brand-primary/20",
    textColor: "text-brand-primary",
  },
  {
    quote:
      "It feels like Notion, but built specifically for focused, structured thinking. The journal + goals combo is something I didn't know I needed.",
    name: "Fatima Zahra",
    role: "Computer Science Student",
    initials: "FZ",
    color: "bg-brand-secondary/20",
    textColor: "text-brand-secondary",
  },
  {
    quote:
      "I was juggling Notion, Todoist, and a random notes app. PK-Manager replaced all three. My mind feels cleaner and my work is more intentional.",
    name: "James Thorpe",
    role: "Indie Developer & Creator",
    initials: "JT",
    color: "bg-yellow-400/20",
    textColor: "text-yellow-400",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-yellow-400">
            Loved By Users
          </span>
          <h2 className="mb-4 text-4xl font-display font-extrabold tracking-tight text-text-main md:text-5xl">
            What People Are Saying
          </h2>
          <p className="mx-auto max-w-xl text-lg text-text-muted">
            Real results from people who made PK-Manager their daily workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, name, role, initials, color, textColor }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col gap-5 rounded-2xl border border-white/5 bg-surface-soft p-6"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <FiStar key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-text-muted">
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}
                >
                  <span className={`text-sm font-bold ${textColor}`}>{initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">{name}</p>
                  <p className="text-xs text-text-muted">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
