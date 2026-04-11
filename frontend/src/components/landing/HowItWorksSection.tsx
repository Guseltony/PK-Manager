"use client";

import { motion } from "framer-motion";
import { FiFileText, FiTag, FiCheckSquare, FiBarChart2 } from "react-icons/fi";

const steps = [
  {
    number: "01",
    icon: FiFileText,
    title: "Capture Ideas",
    description:
      "Write notes in markdown. Dump your thoughts, learnings, and research into your personal knowledge base.",
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
    line: "from-brand-primary/30",
  },
  {
    number: "02",
    icon: FiTag,
    title: "Connect & Tag",
    description:
      "Link related notes together and organize them with flexible tags. Build a web of connected knowledge.",
    color: "text-brand-secondary",
    bg: "bg-brand-secondary/10",
    line: "from-brand-secondary/30",
  },
  {
    number: "03",
    icon: FiCheckSquare,
    title: "Turn Into Tasks",
    description:
      "Convert your insights into concrete action items. Track progress from 'Todo' → 'In Progress' → 'Done'.",
    color: "text-green-400",
    bg: "bg-green-400/10",
    line: "from-green-400/30",
  },
  {
    number: "04",
    icon: FiBarChart2,
    title: "Track & Reflect",
    description:
      "Log progress in your daily journal, hit your goals, and watch your second brain grow smarter every day.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    line: "",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 px-6">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[60px_60px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full border border-brand-secondary/20 bg-brand-secondary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-secondary">
            Simple Workflow
          </span>
          <h2 className="mb-4 text-4xl font-display font-extrabold tracking-tight text-text-main md:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-lg text-text-muted">
            Four simple steps from scattered thoughts to focused execution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {steps.map(
            ({ number, icon: Icon, title, description, color, bg }, i) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute top-10 left-1/2 hidden h-px w-full bg-linear-to-r from-white/10 to-transparent md:block" />
                )}

                {/* Step circle */}
                <div
                  className={`relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/5 ${bg}`}
                >
                  <Icon size={28} className={color} />
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-surface-base border border-white/10 text-[10px] font-bold text-text-muted">
                    {number.replace("0", "")}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-text-main">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-text-muted">
                  {description}
                </p>
              </motion.div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
