"use client";

import { useState } from "react";
import Modal from "./Modal";
import { FiPlus } from "react-icons/fi";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  suggestions?: string[];
}

export default function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  placeholder = "Type here...",
  defaultValue = "",
  suggestions = [],
}: PromptModalProps) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [value, setValue] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setValue(defaultValue);
      setIsSubmitting(false);
    }
  }

  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(value.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col">
        <p className="text-text-muted mb-6 text-sm">{message}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-text-main outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
            />
            {isFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-base border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden py-1 max-h-60 overflow-y-auto backdrop-blur-xl">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={async (e) => {
                        e.preventDefault(); // Prevent blur
                        if (isSubmitting) return;
                        try {
                          setIsSubmitting(true);
                          await onSubmit(suggestion);
                          onClose();
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all flex items-center justify-between group border-b border-white/5 last:border-none"
                    >
                      <span className="truncate flex-1 mr-2">{suggestion}</span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] uppercase tracking-tighter text-brand-primary/60">Connect</span>
                         <FiPlus size={12} className="text-brand-primary" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">
                      No matches found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-text-muted hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim() || isSubmitting}
              className="flex-1 py-3 rounded-2xl text-sm font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
