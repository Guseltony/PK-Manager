"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiInbox, FiPlus } from "react-icons/fi";
import Modal from "../../components/ui/Modal";
import { useInbox } from "../../hooks/useInbox";
import UniversalCaptureComposer from "./UniversalCaptureComposer";

export default function GlobalInboxCapture() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { captureInbox, isCapturing } = useInbox();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open universal capture"
        className="fixed bottom-5 right-4 z-[110] inline-flex items-center gap-3 rounded-full border border-brand-primary/30 bg-brand-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_18px_45px_rgba(99,102,241,0.35)] transition hover:scale-[1.02] sm:bottom-6 sm:right-6"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-base">
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
        contentClassName="max-h-[80vh] overflow-y-auto custom-scrollbar"
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
