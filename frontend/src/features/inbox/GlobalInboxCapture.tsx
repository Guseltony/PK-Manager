"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiInbox, FiPlus } from "react-icons/fi";
import Modal from "../../components/ui/Modal";
import { useInbox } from "../../hooks/useInbox";
import UniversalCaptureComposer from "./UniversalCaptureComposer";

export default function GlobalInboxCapture() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { captureInbox, isCapturing } = useInbox();

  if (pathname?.startsWith("/inbox")) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open universal capture"
        className="fixed bottom-20 right-4 z-[110] inline-flex items-center gap-2 rounded-2xl border border-brand-primary/30 bg-brand-primary px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-black shadow-[0_18px_45px_rgba(99,102,241,0.35)] transition hover:scale-[1.02] sm:bottom-6 sm:right-6 sm:gap-3 sm:rounded-full sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.18em]"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/10 text-base sm:h-9 sm:w-9 sm:rounded-full">
          <FiPlus />
        </span>
        <span className="hidden sm:inline">Capture</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Universal Capture"
        panelClassName="max-w-3xl"
        containerClassName="items-end sm:items-center"
        contentClassName="max-h-[80vh] overflow-y-auto custom-scrollbar !px-1"
      >
        <UniversalCaptureComposer
          variant="modal"
          onSubmitCapture={captureInbox}
          isSubmitting={isCapturing}
          onSubmitted={() => setIsOpen(false)}
          onOpenInbox={() => {
            setIsOpen(false);
            router.push("/inbox");
          }}
        />

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
              Inbox Access
            </p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Open the full inbox to review routing, corrections, and history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              router.push("/inbox");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-black/30"
          >
            <FiInbox />
            Open inbox
          </button>
        </div>
      </Modal>
    </>
  );
}

