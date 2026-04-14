"use client";

import React from "react";
import { FiBox, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function ArchivePage() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-base">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-12">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold text-[10px] uppercase tracking-widest mb-6"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </Link>
          <h1 className="text-4xl font-display font-black text-text-main mb-2 tracking-tight">
            DEEP <span className="text-brand-primary">STORAGE</span>
          </h1>
          <p className="text-text-muted text-sm max-w-lg leading-relaxed">
            Access your archived intelligence and historical records. 
            These nodes are preserved for reference but removed from your active focus workspace.
          </p>
        </header>

        <div className="glass rounded-[2rem] border border-white/5 p-8 sm:p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <FiBox size={40} className="text-text-muted/20" />
          </div>
          <h3 className="text-xl font-bold text-text-main mb-2">Vault is Currently Empty</h3>
          <p className="text-text-muted text-sm max-w-xs">
            As your knowledge base matures, archived items will appear here for long-term preservation.
          </p>
        </div>
      </div>
    </div>
  );
}
