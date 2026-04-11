"use client";

import { motion } from "framer-motion";
import { FiCode, FiBookOpen, FiEdit3 } from "react-icons/fi";
import { FaBrain } from "react-icons/fa";

const audiences = [
  {
    icon: FiCode,
    title: "Developers",
    description:
      "Track what you're learning, store code snippets, and manage projects — all connected.",
    tags: ["Code Notes", "Learning Paths", "Project Planning"],
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
  },
  {
    icon: FiBookOpen,
    title: "Students",
    description:
      "Organize lectures, research, and study sessions. Never lose a key insight again.",
    tags: ["Study Notes", "Research", "Exam Prep"],
    color: "text-brand-secondary",
    bg: "bg-brand-secondary/10",
  },
  {
    icon: FiEdit3,
    title: "Creators",
    description:
      "Capture content ideas, map out projects, and track your creative output over time.",
    tags: ["Content Ideas", "Project Tracking", "Brainstorming"],
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: FaBrain,
    title: "Second Brainers",
    description:
      "Anyone building a \"second brain\" to offload thinking and enable deeper focus.",
    tags: ["Knowledge Base", "Personal OS", "Life Tracking"],
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

export default function WhoIsItForSection() {
  return (
    <section id="who-it-s-for" className="py-32 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <span className="mb-3 inline-block rounded-full border border-green-500/20 bg-green-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-green-400">
            Made For
          </span>
          <h2 className="mb-4 text-4xl font-display font-extrabold tracking-tight text-text-main md:text-5xl">
            Who Is It For?
          </h2>
          <p className="mx-auto max-w-xl text-lg text-text-muted">
            Whether you&apos;re a developer, student, or creator — if you think a lot,
            PK-Manager is for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map(({ icon: Icon, title, description, tags, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-surface-soft p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/10"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <h3 className="mb-1.5 text-lg font-bold text-text-main">{title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{description}</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/5 bg-surface-base px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
