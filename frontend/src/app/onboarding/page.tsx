"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiShield, FiTarget, FiZap, FiCheckCircle, FiAnchor } from "react-icons/fi";
import api from "@/src/libs/api";

type Step = "welcome" | "mission" | "pillars" | "nonneg" | "habits" | "done";

const PILLAR_PRESETS = [
  { name: "Technical Mastery", desc: "Own your craft without reliance.", icon: "FiZap", color: "text-brand-primary" },
  { name: "Financial Stability", desc: "Build income that doesn't depend on one source.", icon: "FiAward", color: "text-amber-400" },
  { name: "Mental Discipline", desc: "Systems over motivation. No zero days.", icon: "FiAnchor", color: "text-emerald-400" },
  { name: "Physical Presence", desc: "Consistent sleep, health habits, and calmness.", icon: "FiShield", color: "text-sky-400" },
  { name: "Relationships", desc: "Invest in people who matter. Let go of the rest.", icon: "FiHeart", color: "text-pink-400" },
  { name: "Spiritual Foundation", desc: "Know who you are outside of achievement.", icon: "FiSun", color: "text-yellow-400" },
];

const HABIT_PRESETS = [
  { title: "Code for 3 hours", color: "text-brand-primary", icon: "FiZap", pillarName: "Technical Mastery" },
  { title: "Morning workout", color: "text-emerald-400", icon: "FiTarget", pillarName: "Physical Presence" },
  { title: "Read 30 minutes", color: "text-amber-400", icon: "FiBook", pillarName: "Mental Discipline" },
  { title: "Journal entry", color: "text-sky-400", icon: "FiEdit3", pillarName: "Mental Discipline" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [selectedPillars, setSelectedPillars] = useState<typeof PILLAR_PRESETS>([]);
  const [nonNeg, setNonNeg] = useState("No zero days. Execute every day.\nNo excuses. Accept the outcome you built.");
  const [selectedHabits, setSelectedHabits] = useState<typeof HABIT_PRESETS>([]);

  const togglePillar = (p: (typeof PILLAR_PRESETS)[0]) => {
    setSelectedPillars(prev =>
      prev.some(x => x.name === p.name) ? prev.filter(x => x.name !== p.name) : [...prev, p]
    );
  };

  const toggleHabit = (h: (typeof HABIT_PRESETS)[0]) => {
    setSelectedHabits(prev =>
      prev.some(x => x.title === h.title) ? prev.filter(x => x.title !== h.title) : [...prev, h]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // Save constitution
      await api.put("/constitution", {
        title: "My Foundation Constitution",
        phase: "The Foundation Era",
        mission,
        vision,
        pillars: selectedPillars,
        nonNegotiables: nonNeg.split("\n").filter(Boolean),
      });

      // Seed selected habits
      for (const habit of selectedHabits) {
        await api.post("/habit", { ...habit, frequency: "daily" });
      }

      localStorage.setItem("pkm_onboarding_completed", "true");
      setStep("done");
    } catch {
      setIsSaving(false);
    }
  };

  const stepContent: Record<Step, React.ReactNode> = {
    welcome: (
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
          <FiAnchor className="text-brand-primary" size={40} />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Welcome to PK-Manager</h1>
          <p className="mt-3 text-lg text-text-muted max-w-md mx-auto">
            Before you begin, let&apos;s build your Foundation. This will anchor everything you do on this platform.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {[{ icon: <FiShield />, label: "Constitution" }, { icon: <FiTarget />, label: "Habits" }, { icon: <FiZap />, label: "Mission" }].map(item => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-surface-soft p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">{item.icon}</div>
              <p className="text-xs font-bold text-text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    ),

    mission: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Mission</h2>
          <p className="mt-1 text-sm text-text-muted">Why are you building yourself? What is the core purpose?</p>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-primary">Mission (Who you&apos;re becoming)</label>
          <textarea
            autoFocus
            rows={3}
            value={mission}
            onChange={e => setMission(e.target.value)}
            placeholder="e.g. To become a capable founder, builder, and leader who solves real problems."
            className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-emerald-400">Legacy (Your 10-year vision)</label>
          <textarea
            rows={3}
            value={vision}
            onChange={e => setVision(e.target.value)}
            placeholder="e.g. A legacy of technology, healthcare, and education to rebuild nations."
            className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>
    ),

    pillars: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Foundation Pillars</h2>
          <p className="mt-1 text-sm text-text-muted">Select the pillars that hold your life together. These become your constitutional anchors.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PILLAR_PRESETS.map(p => {
            const isSelected = selectedPillars.some(x => x.name === p.name);
            return (
              <button
                key={p.name}
                onClick={() => togglePillar(p)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${isSelected ? "border-brand-primary/50 bg-brand-primary/10" : "border-white/10 bg-surface-soft hover:border-white/20"}`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/40 ${p.color}`}>
                  {isSelected ? <FiCheckCircle size={16} /> : <FiTarget size={16} />}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{p.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ),

    nonneg: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Non-Negotiables</h2>
          <p className="mt-1 text-sm text-text-muted">These are the rules you do not break. They protect your mission. One per line.</p>
        </div>
        <textarea
          rows={8}
          value={nonNeg}
          onChange={e => setNonNeg(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white focus:border-brand-primary focus:outline-none font-mono leading-7"
        />
      </div>
    ),

    habits: (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Seed Your First Habits</h2>
          <p className="mt-1 text-sm text-text-muted">Select habits to start tracking immediately. You can create more anytime.</p>
        </div>
        <div className="space-y-3">
          {HABIT_PRESETS.map(h => {
            const isSelected = selectedHabits.some(x => x.title === h.title);
            return (
              <button
                key={h.title}
                onClick={() => toggleHabit(h)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${isSelected ? "border-emerald-400/40 bg-emerald-400/5" : "border-white/10 bg-surface-soft hover:border-white/20"}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/40 ${h.color}`}>
                  {isSelected ? <FiCheckCircle size={18} /> : <FiTarget size={18} />}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{h.title}</p>
                  <p className="text-xs text-text-muted">Linked to: {h.pillarName}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ),

    done: (
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
          <FiCheckCircle className="text-emerald-400" size={44} />
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Foundation Built.</h1>
          <p className="mt-3 text-lg text-text-muted max-w-md mx-auto">
            Your Constitution, Pillars, and Habits are saved. Your journey officially starts now.
          </p>
        </div>
      </div>
    ),
  };

  const stepOrder: Step[] = ["welcome", "mission", "pillars", "nonneg", "habits", "done"];
  const stepIndex = stepOrder.indexOf(step);
  const isLast = step === "habits";

  const handleNext = async () => {
    if (isLast) {
      await handleFinish();
    } else if (step !== "done") {
      setStep(stepOrder[stepIndex + 1]);
    } else {
      router.push("/constitution");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base text-text-main">
      {/* Progress bar */}
      {step !== "done" && (
        <div className="h-1 w-full bg-white/5">
          <motion.div
            className="h-full bg-brand-primary"
            animate={{ width: `${((stepIndex + 1) / (stepOrder.length - 1)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10">
            <button
              onClick={handleNext}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary py-4 text-base font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : step === "done" ? "Open My Constitution" : step === "habits" ? "Finish & Save" : "Continue"}
              {step !== "done" && <FiArrowRight />}
            </button>
            {step !== "welcome" && step !== "done" && (
              <button
                onClick={() => setStep(stepOrder[stepIndex - 1])}
                className="mt-3 w-full py-2 text-sm text-text-muted hover:text-white transition"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
