"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiInbox, FiPlus } from "react-icons/fi";
import Modal from "../../components/ui/Modal";
import { useInbox } from "../../hooks/useInbox";
import { useUIStore } from "../../store/uiStore";
import UniversalCaptureComposer from "./UniversalCaptureComposer";

export default function GlobalInboxCapture() {
  const router = useRouter();
  const pathname = usePathname();
  const { isCaptureModalOpen, setCaptureModalOpen } = useUIStore();
  const { captureInbox, isCapturing } = useInbox();

  if (pathname?.startsWith("/inbox")) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={isCaptureModalOpen}
        onClose={() => setCaptureModalOpen(false)}
        title="Universal Capture"
        panelClassName="max-w-3xl"
        containerClassName="items-end sm:items-center"
        contentClassName="max-h-[80vh] overflow-y-auto custom-scrollbar !px-1"
      >
        <UniversalCaptureComposer
          variant="modal"
          onSubmitCapture={captureInbox}
          isSubmitting={isCapturing}
          onSubmitted={() => setCaptureModalOpen(false)}
          onOpenInbox={() => {
            setCaptureModalOpen(false);
            router.push("/inbox");
          }}
        />

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface-mutes/50 px-4 py-3">
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
              setCaptureModalOpen(false);
              router.push("/inbox");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-mutes/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-main transition hover:bg-surface-mutes/30"
          >
            <FiInbox />
            Open inbox
          </button>
        </div>
      </Modal>
    </>
  );
}

