"use client";

import Modal from "./Modal";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${variant === "danger" ? "bg-red-400/10 text-red-500" : "bg-brand-primary/10 text-brand-primary"}`}>
          <FiAlertTriangle size={32} />
        </div>
        <p className="text-text-muted mb-8 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-text-muted hover:bg-white/5 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all ${
              variant === "danger" 
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                : "bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/20"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
