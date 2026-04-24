"use client";

import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  FiActivity,
  FiBell,
  FiLoader,
  FiRefreshCcw,
  FiSave,
  FiSettings,
  FiShield,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import { useSettings } from "../../hooks/useSettings";
import type { Settings } from "../../types/settings";
import { FaBrain } from "react-icons/fa";

type ToggleKey =
  | "autoTaskGenerationFromDreams"
  | "autoLinkingKnowledgeGraph"
  | "autoProjectGeneration"
  | "autoTaskBreakdownFromDreams"
  | "taskReminders"
  | "focusSessionAlerts"
  | "dailyInsightSummaries"
  | "missedJournalReminders";

const groupedSelects = {
  aiStrictness: ["low", "medium", "high"],
  aiProactiveness: ["passive", "active", "autonomous"],
  aiReasoningDepth: ["fast", "balanced", "deep"],
  autoInsightFrequency: ["real_time", "hourly", "daily"],
  inboxRoutingSensitivity: ["strict", "flexible"],
  taskPrioritizationMode: ["manual", "ai_assisted", "fully_automated"],
  deadlineEnforcement: ["soft", "medium", "strict"],
  ledgerStrictness: ["soft", "balanced", "strict"],
  failureVisibility: ["hidden", "user_only", "dashboard_and_insights"],
  dreamProgressSensitivity: ["low", "medium", "high"],
} satisfies Partial<Record<keyof Settings, string[]>>;

export default function SettingsPage() {
  const { settings, isLoading, updateSettingsAsync, resetSettingsAsync, isUpdating, isResetting } = useSettings();
  const [localChanges, setLocalChanges] = useState<Partial<Settings>>({});
  const [saveMessage, setSaveMessage] = useState("");

  const draft = useMemo(() => {
    if (!settings) {
      return null;
    }

    return {
      ...settings,
      ...localChanges,
    };
  }, [localChanges, settings]);

  const hasChanges = useMemo(() => {
    if (!draft || !settings) {
      return false;
    }
    return JSON.stringify(draft) !== JSON.stringify(settings);
  }, [draft, settings]);

  const handleSave = async () => {
    if (!draft) {
      return;
    }
    await updateSettingsAsync(draft);
    setLocalChanges({});
    setSaveMessage("System behavior profile saved.");
    setTimeout(() => setSaveMessage(""), 2500);
  };

  const handleToggle = (key: ToggleKey) => {
    if (!draft) {
      return;
    }
    setLocalChanges((current) => ({ ...current, [key]: !draft[key] }));
  };

  const handleSelect = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocalChanges((current) => ({ ...current, [key]: value }));
  };

  if (isLoading || !draft) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-[28px] border border-white/10 bg-surface-soft" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-surface-soft shadow-2xl">
        <div className="bg-linear-to-r from-brand-primary/18 via-transparent to-emerald-400/15 px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-primary">
                Cognitive Operating System Control
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                Settings
              </h1>
              <p className="mt-3 text-sm leading-7 text-text-muted">
                These settings are the highest authority layer in PK-Manager.
                They define how AI behaves, how strict accountability becomes,
                and where automation is allowed to operate.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton
                icon={FiRefreshCcw}
                label={isResetting ? "Resetting..." : "Reset Defaults"}
                onClick={async () => {
                  const next = await resetSettingsAsync();
                  setLocalChanges({});
                  if (next) {
                    setSaveMessage(
                      "System behavior profile reset to defaults.",
                    );
                    setTimeout(() => setSaveMessage(""), 2500);
                  }
                }}
                disabled={isResetting}
                tone="secondary"
              />
              <ActionButton
                icon={FiSave}
                label={isUpdating ? "Saving..." : "Save Control Profile"}
                onClick={handleSave}
                disabled={isUpdating || !hasChanges}
                tone="primary"
              />
            </div>
          </div>
        </div>
      </section>

      {saveMessage ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {saveMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingsCard
          eyebrow="AI Behavior Settings"
          title="Global intelligence behavior"
          description="These values set the default temperament of the system and override softer AI assumptions elsewhere."
          icon={FaBrain}
        >
          <SelectField
            label="AI strictness"
            value={draft.aiStrictness}
            options={groupedSelects.aiStrictness!}
            onChange={(value) =>
              handleSelect("aiStrictness", value as Settings["aiStrictness"])
            }
          />
          <SelectField
            label="AI proactiveness"
            value={draft.aiProactiveness}
            options={groupedSelects.aiProactiveness!}
            onChange={(value) =>
              handleSelect(
                "aiProactiveness",
                value as Settings["aiProactiveness"],
              )
            }
          />
          <SelectField
            label="AI reasoning depth"
            value={draft.aiReasoningDepth}
            options={groupedSelects.aiReasoningDepth!}
            onChange={(value) =>
              handleSelect(
                "aiReasoningDepth",
                value as Settings["aiReasoningDepth"],
              )
            }
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="Automation Settings"
          title="System automation boundaries"
          description="Use this layer to determine what the PKM engine may create, route, or infer without waiting for you."
          icon={FiZap}
        >
          <ToggleField
            label="Auto-task generation from dreams"
            checked={draft.autoTaskGenerationFromDreams}
            onToggle={() => handleToggle("autoTaskGenerationFromDreams")}
          />
          <ToggleField
            label="Auto-linking in knowledge graph"
            checked={draft.autoLinkingKnowledgeGraph}
            onToggle={() => handleToggle("autoLinkingKnowledgeGraph")}
          />
          <SelectField
            label="Auto-insight frequency"
            value={draft.autoInsightFrequency}
            options={groupedSelects.autoInsightFrequency!}
            onChange={(value) =>
              handleSelect(
                "autoInsightFrequency",
                value as Settings["autoInsightFrequency"],
              )
            }
          />
          <SelectField
            label="Inbox routing sensitivity"
            value={draft.inboxRoutingSensitivity}
            options={groupedSelects.inboxRoutingSensitivity!}
            onChange={(value) =>
              handleSelect(
                "inboxRoutingSensitivity",
                value as Settings["inboxRoutingSensitivity"],
              )
            }
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="Task System Behavior"
          title="Execution pressure controls"
          description="These controls determine how aggressively the system prioritizes work and how strongly it reacts to deadlines."
          icon={FiActivity}
        >
          <SelectField
            label="Task prioritization mode"
            value={draft.taskPrioritizationMode}
            options={groupedSelects.taskPrioritizationMode!}
            onChange={(value) =>
              handleSelect(
                "taskPrioritizationMode",
                value as Settings["taskPrioritizationMode"],
              )
            }
          />
          <SelectField
            label="Deadline enforcement"
            value={draft.deadlineEnforcement}
            options={groupedSelects.deadlineEnforcement!}
            onChange={(value) =>
              handleSelect(
                "deadlineEnforcement",
                value as Settings["deadlineEnforcement"],
              )
            }
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="Ledger Accountability"
          title="Failure visibility and accountability"
          description="This system controls how seriously execution gaps are tracked and how loudly they appear in the dashboard and insights layers."
          icon={FiShield}
        >
          <SelectField
            label="Ledger strictness"
            value={draft.ledgerStrictness}
            options={groupedSelects.ledgerStrictness!}
            onChange={(value) =>
              handleSelect(
                "ledgerStrictness",
                value as Settings["ledgerStrictness"],
              )
            }
          />
          <SelectField
            label="Failure visibility"
            value={draft.failureVisibility}
            options={groupedSelects.failureVisibility!}
            onChange={(value) =>
              handleSelect(
                "failureVisibility",
                value as Settings["failureVisibility"],
              )
            }
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="Dream System"
          title="Vision-to-structure conversion"
          description="These controls define how fast dreams become structured initiatives and how sensitive progress detection should be."
          icon={FiTarget}
        >
          <ToggleField
            label="Auto project generation from dreams"
            checked={draft.autoProjectGeneration}
            onToggle={() => handleToggle("autoProjectGeneration")}
          />
          <ToggleField
            label="Auto task breakdown from dreams"
            checked={draft.autoTaskBreakdownFromDreams}
            onToggle={() => handleToggle("autoTaskBreakdownFromDreams")}
          />
          <SelectField
            label="Dream progress sensitivity"
            value={draft.dreamProgressSensitivity}
            options={groupedSelects.dreamProgressSensitivity!}
            onChange={(value) =>
              handleSelect(
                "dreamProgressSensitivity",
                value as Settings["dreamProgressSensitivity"],
              )
            }
          />
        </SettingsCard>

        <SettingsCard
          eyebrow="Notifications"
          title="Attention routing"
          description="Choose which signals deserve to interrupt you and which ones should stay ambient."
          icon={FiBell}
        >
          <ToggleField
            label="Task reminders"
            checked={draft.taskReminders}
            onToggle={() => handleToggle("taskReminders")}
          />
          <ToggleField
            label="Focus session alerts"
            checked={draft.focusSessionAlerts}
            onToggle={() => handleToggle("focusSessionAlerts")}
          />
          <ToggleField
            label="Daily insight summaries"
            checked={draft.dailyInsightSummaries}
            onToggle={() => handleToggle("dailyInsightSummaries")}
          />
          <ToggleField
            label="Missed journal reminders"
            checked={draft.missedJournalReminders}
            onToggle={() => handleToggle("missedJournalReminders")}
          />
        </SettingsCard>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-surface-soft p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-primary/15 p-3 text-brand-primary">
            <FiSettings />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">
              Authority Rule
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Settings always win
            </h2>
          </div>
        </div>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-text-muted">
          If an AI suggestion conflicts with these settings, this control
          profile is the final authority. That makes this page the behavior
          contract for every automation and intelligence layer across inbox,
          tasks, dreams, ledger, and insights.
        </p>
      </section>
    </div>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-surface-soft p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-text-muted">{description}</p>
        </div>
        <div className="rounded-2xl bg-brand-primary/12 p-3 text-brand-primary">
          <Icon />
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-primary/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-left transition hover:border-brand-primary/20"
    >
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="mt-1 text-xs text-text-muted">{checked ? "Enabled" : "Disabled"}</p>
      </div>
      <div className={`relative h-7 w-14 rounded-full transition ${checked ? "bg-brand-primary" : "bg-white/15"}`}>
        <div className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${checked ? "left-7" : "left-1"}`} />
      </div>
    </button>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
        tone === "primary"
          ? "bg-brand-primary text-white hover:brightness-110"
          : "border border-white/10 bg-black/20 text-white hover:bg-white/10"
      }`}
    >
      {disabled ? <FiLoader className="animate-spin" /> : <Icon />}
      {label}
    </button>
  );
}
