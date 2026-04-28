"use client";

import { useEffect, useSyncExternalStore } from "react";
import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  panelClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  containerClassName?: string;
}

const emptySubscribe = () => () => {};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  panelClassName = "max-w-md",
  headerClassName = "",
  contentClassName = "",
  containerClassName = "",
}: ModalProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (isOpen && isClient) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isClient]);

  if (!isClient || !isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 ${containerClassName}`}>
      <div
        className={`relative w-full bg-surface-base border border-white/10 rounded-3xl shadow-2xl shadow-black/50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-white/5 bg-white/5 ${headerClassName}`}>
          <h3 className="text-lg font-bold text-text-main uppercase tracking-widest">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-main hover:bg-white/10 rounded-xl transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 ${contentClassName}`}>{children}</div>
      </div>

      {/* Backdrop overlay for closing */}
      <div className="-z-10 absolute inset-0" onClick={onClose} />
    </div>,
    document.body,
  );
}
