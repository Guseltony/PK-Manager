"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiShield, FiTarget, FiZap, FiCheckCircle, FiAnchor, FiAward, FiHeart, FiSun, FiBook, FiEdit3 } from "react-icons/fi";
import api from "@/src/libs/api";
import Image from "next/image";

type Step = "welcome" | "mission" | "pillars" | "nonneg" | "habits" | "done";

const PILLAR_PRESETS = [
  { name: "Technical Mastery", desc: "Own your craft without reliance.", icon: <FiZap />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Financial Stability", desc: "Build income that doesn't depend on one source.", icon: <FiAward />, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { name: "Mental Discipline", desc: "Systems over motivation. No zero days.", icon: <FiAnchor />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Physical Presence", desc: "Consistent sleep, health habits, and calmness.", icon: <FiShield />, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { name: "Relationships", desc: "Invest in people who matter.", icon: <FiHeart />, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { name: "Spiritual Foundation", desc: "Know who you are outside of achievement.", icon: <FiSun />, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
];

const HABIT_PRESETS = [
  { title: "Code for 3 hours", color: "text-blue-500", icon: <FiZap />, pillarName: "Technical Mastery" },
  { title: "Morning workout", color: "text-emerald-500", icon: <FiTarget />, pillarName: "Physical Presence" },
  { title: "Read 30 minutes", color: "text-amber-500", icon: <FiBook />, pillarName: "Mental Discipline" },
  { title: "Journal entry", color: "text-sky-500", icon: <FiEdit3 />, pillarName: "Mental Discipline" },
];

const IllustrationWrapper = ({ src, alt }: { src: string; alt: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative w-full aspect-square max-w-[280px] mx-auto mb-8"
  >
    <div className="absolute inset-0 bg-brand-primary/10 blur-[60px] rounded-full" />
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain relative z-10"
      priority
    />
  </motion.div>
);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [isSaving, setIsSaving] = useState(false);

  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [nonNeg, setNonNeg] = useState("No zero days. Execute every day.\nNo excuses. Accept the outcome you built.");
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  const togglePillar = (name: string) => {
    setSelectedPillars(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const toggleHabit = (title: string) => {
    setSelectedHabits(prev =>
      prev.includes(title) ? prev.filter(x => x !== title) : [...prev, title]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await api.put("/constitution", {
        title: "My Foundation Constitution",
        phase: "The Foundation Era",
        mission,
        vision,
        pillars: PILLAR_PRESETS.filter(p => selectedPillars.includes(p.name)),
        nonNegotiables: nonNeg.split("\n").filter(Boolean),
      });

      for (const habitTitle of selectedHabits) {
        const habit = HABIT_PRESETS.find(h => h.title === habitTitle);
        if (habit) await api.post("/habit", { ...habit, frequency: "daily" });
      }

      localStorage.setItem("pkm_onboarding_completed", "true");
      setStep("done");
    } catch {
      setIsSaving(false);
    }
  };

  const stepContent: Record<Step, React.ReactNode> = {
    welcome: (
      <div className="flex flex-col items-center text-center">
        <IllustrationWrapper 
          src="/onboarding_welcome.png" 
          alt="Welcome" 
        />
        <h1 className="font-display text-4xl font-bold text-text-main leading-tight">Welcome to <br/><span className="text-brand-primary">PK-Manager</span></h1>
        <p className="mt-4 text-lg text-text-muted max-w-md">
          Let&apos;s build your <strong>Foundation Constitution</strong>. This anchors your mission, pillars, and daily habits.
        </p>
      </div>
    ),

    mission: (
      <div className="space-y-6">
        <IllustrationWrapper 
          src="/onboarding_mission.png" 
          alt="Mission" 
        />
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-main">Define Your North Star</h2>
          <p className="mt-2 text-text-muted">What is your core mission in this season of life?</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-brand-primary">Mission (Current Focus)</label>
            <textarea
              autoFocus
              rows={2}
              value={mission}
              onChange={e => setMission(e.target.value)}
              placeholder="e.g. Building a sustainable SaaS business while mastering AI engineering."
              className="w-full rounded-2xl border border-border bg-surface-soft p-4 text-text-main focus:border-brand-primary focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-emerald-500">10-Year Vision (Legacy)</label>
            <textarea
              rows={2}
              value={vision}
              onChange={e => setVision(e.target.value)}
              placeholder="e.g. Leading a technology company that empowers creators globally."
              className="w-full rounded-2xl border border-border bg-surface-soft p-4 text-text-main focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    ),

    pillars: (
      <div className="space-y-6">
        <IllustrationWrapper 
          src="/onboarding_pillars.png" 
          alt="Pillars" 
        />
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-text-main">Foundation Pillars</h2>
          <p className="mt-2 text-text-muted">Select the core areas that require your absolute focus.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 max-h-[320px] overflow-y-auto px-1 custom-scrollbar">
          {PILLAR_PRESETS.map(p => {
            const isSelected = selectedPillars.includes(p.name);
            return (
              <button
                key={p.name}
                onClick={() => togglePillar(p.name)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${isSelected ? "border-brand-primary bg-brand-primary/10 scale-[1.02]" : "border-border bg-surface-soft hover:border-brand-primary/30"}`}
              >
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${p.bg} ${p.color}`}>
                  {p.icon}
                </div>
                <div>
                  <p className="font-bold text-text-main text-sm">{p.name}</p>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ),

    nonneg: (
      <div className="space-y-6">
        <div className="text-center mb-8">
           <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-accent/10 text-brand-accent shadow-xl shadow-brand-accent/5">
            <FiAnchor size={40} />
          </div>
          <h2 className="text-3xl font-bold text-text-main">Non-Negotiables</h2>
          <p className="mt-2 text-text-muted">The unbreakable rules that guard your progress.</p>
        </div>
        <div className="relative group">
          <textarea
            rows={6}
            value={nonNeg}
            onChange={e => setNonNeg(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface-soft p-5 text-sm text-text-main focus:border-brand-primary focus:outline-none font-mono leading-7 transition-all shadow-inner"
          />
          <div className="absolute bottom-4 right-4 text-[10px] uppercase tracking-widest text-text-muted font-bold opacity-50">One rule per line</div>
        </div>
      </div>
    ),

    habits: (
      <div className="space-y-6">
        <IllustrationWrapper 
          src="/onboarding_habits.png" 
          alt="Habits" 
        />
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-text-main">Seed Daily Habits</h2>
          <p className="mt-2 text-text-muted">Systems outperform motivation. Start tracking these today.</p>
        </div>
        <div className="space-y-3">
          {HABIT_PRESETS.map(h => {
            const isSelected = selectedHabits.includes(h.title);
            return (
              <button
                key={h.title}
                onClick={() => toggleHabit(h.title)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${isSelected ? "border-emerald-500 bg-emerald-500/5" : "border-border bg-surface-soft hover:border-brand-primary/30"}`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-base ${h.color} shadow-sm`}>
                  {h.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-text-main text-sm">{h.title}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{h.pillarName}</p>
                </div>
                {isSelected && <FiCheckCircle className="text-emerald-500" size={20} />}
              </button>
            );
          })}
        </div>
      </div>
    ),

    done: (
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-12">
           <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full animate-pulse" />
           <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-500/10">
            <FiCheckCircle className="text-emerald-500" size={64} />
          </div>
        </div>
        <h1 className="font-display text-4xl font-bold text-text-main">Foundation Built.</h1>
        <p className="mt-4 text-xl text-text-muted max-w-md">
          Your Constitution is locked in. The journey to technical and personal mastery starts now.
        </p>
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
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base text-text-main selection:bg-brand-primary/30">
      {/* Top Progress Line */}
      {step !== "done" && (
        <div className="fixed top-0 left-0 right-0 h-1.5 bg-surface-soft z-50">
          <motion.div
            className="h-full bg-brand-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            animate={{ width: `${((stepIndex + 1) / (stepOrder.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: "circOut" }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.4, ease: "backOut" }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 space-y-4">
            <button
              onClick={handleNext}
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand-primary py-4 text-lg font-bold text-white shadow-xl shadow-brand-primary/25 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  {step === "done" ? "Enter Dashboard" : step === "habits" ? "Commit to Growth" : "Continue"}
                  {step !== "done" && <FiArrowRight />}
                </>
              )}
            </button>
            
            {step !== "welcome" && step !== "done" && (
              <button
                onClick={() => setStep(stepOrder[stepIndex - 1])}
                className="w-full py-2 text-sm font-semibold text-text-muted hover:text-text-main transition-all"
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

