"use client";

import { motion } from "framer-motion";
import {
  FiFileText,
  FiLink2,
  FiCheckSquare,
  FiBook,
  FiTarget,
  FiSearch,
} from "react-icons/fi";

const features = [
  {
    icon: FiFileText,
    title: "Smart Notes",
    description:
      "Capture ideas in rich markdown. Auto-save, link to tasks, and build your personal knowledge library.",
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
    border: "border-brand-primary/20",
  },
  {
    icon: FiLink2,
    title: "Connected Thinking",
    description:
      "Link notes to tasks, goals, and journals. Create a living network of knowledge — not isolated silos.",
    color: "text-brand-secondary",
    bg: "bg-brand-secondary/10",
    border: "border-brand-secondary/20",
  },
  {
    icon: FiCheckSquare,
    title: "Task Execution",
    description:
      "Turn insights into action. Create tasks directly from notes and track them through to completion.",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    icon: FiBook,
    title: "Daily Journal",
    description:
      "Reflect on your progress every day. Link journal entries to tasks and goals for full context.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    icon: FiTarget,
    title: "Goal Tracking",
    description:
      "Define long-term goals, connect them to your daily tasks, and track what matters most to you.",
    color: "text-brand-accent",
    bg: "bg-brand-accent/10",
    border: "border-brand-accent/20",
  },
  {
    icon: FiSearch,
    title: "Fast Search",
    description:
      "Find anything instantly — notes, tasks, goals, tags — with a blazing-fast command palette.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="mx-auto max-w-7xl">
        {/* Section label */}
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-primary">
            Everything You Need
          </span>
          <h2 className="mb-4 text-4xl font-display font-extrabold tracking-tight text-text-main md:text-5xl">
            One workspace.{" "}
            <span className="bg-linear-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Infinite clarity.
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-text-muted">
            Stop juggling 5 different apps. PK-Manager connects your knowledge,
            tasks, and goals in one focused place.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, description, color, bg, border }) => (
            <motion.div
              key={title}
              variants={cardVariants}
              className={`group relative overflow-hidden rounded-2xl border ${border} bg-surface-soft p-6 transition-all duration-300 hover:-translate-y-1 hover:border-opacity-50 hover:shadow-xl hover:shadow-black/20`}
            >
              {/* Glow */}
              <div
                className={`pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full ${bg} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
              </div>

              <h3 className="mb-2 text-lg font-bold text-text-main">{title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
