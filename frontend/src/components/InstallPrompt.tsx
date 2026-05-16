"use client";

import { useState, useEffect } from "react";
import { FiDownload, FiX, FiSmartphone } from "react-icons/fi";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setIsDesktop(mq.matches);

    apply();
    mq.addEventListener?.("change", apply);

    return () => mq.removeEventListener?.("change", apply);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Desktop-only PWA install UX. On smaller screens we prefer APK CTA.
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, [isDesktop]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!isDesktop) return null;
  if (!showPrompt) return null;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-12 h-12 bg-brand-primary text-white rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] z-50 flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Install App"
      >
        <FiDownload size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-72 bg-surface-soft border border-brand-primary/30 p-5 rounded-2xl shadow-2xl z-50 flex flex-col gap-4 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
            <FiSmartphone size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-main">Install App</p>
            <p className="text-[10px] text-text-muted leading-tight mt-0.5">
              Fast, native-like experience
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-text-muted hover:text-text-main bg-surface-mutes/50 hover:bg-white/10 rounded-full p-1.5 transition-colors"
          aria-label="Close install prompt"
        >
          <FiX size={14} />
        </button>
      </div>

      <button
        onClick={handleInstallClick}
        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <FiDownload size={16} />
        Install Now
      </button>
    </div>
  );
}
