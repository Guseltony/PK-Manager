"use client";

import { useState } from "react";
import Modal from "./Modal";

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
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

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setValue(defaultValue);
    }
  }

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
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
              placeholder={placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-text-main outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
            />
            {value && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-soft border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      onSubmit(suggestion);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-text-muted hover:text-text-main hover:bg-white/5 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-text-muted hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 py-3 rounded-2xl text-sm font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
