"use client";

import { useState, useEffect } from "react";
import NavLinks from "./navLinks";
import { HiLightningBolt } from "react-icons/hi";
import { FiMenu, FiX } from "react-icons/fi";

// ============================================================
// Mobile sidebar drawer component
// ============================================================
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <>
      {/* Hamburger trigger — only visible on small screens */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main transition-all border border-white/5"
        aria-label="Open navigation"
      >
        <FiMenu size={18} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-surface-soft border-r border-white/5 flex flex-col p-6 z-50 transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <HiLightningBolt className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-tight text-text-main">
                PKM <span className="text-brand-primary">Manager</span>
              </h1>
              <p className="text-[10px] text-text-muted font-medium tracking-[0.2em] uppercase">
                Knowledge Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-main hover:bg-white/5 transition-all"
          >
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar">
          <NavLinks onLinkClick={() => setOpen(false)} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="bg-brand-primary/10 rounded-2xl p-4 border border-brand-primary/20">
            <p className="text-xs text-brand-primary font-semibold mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[11px] text-text-main font-medium">System Synchronized</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Desktop sidebar — hidden on mobile
// ============================================================
const SideBar = () => {
  return (
    <div className="hidden lg:flex bg-surface-soft w-64 xl:w-72 min-h-screen border-r border-white/5 flex-col p-6 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
          <HiLightningBolt className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight text-text-main">
            PKM <span className="text-brand-primary">Manager</span>
          </h1>
          <p className="text-[10px] text-text-muted font-medium tracking-[0.2em] uppercase">
            Knowledge Engine
          </p>
        </div>
      </div>

      {/* navLinks */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <NavLinks />
      </nav>

      {/* Footer status */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="bg-brand-primary/10 rounded-2xl p-4 border border-brand-primary/20">
          <p className="text-xs text-brand-primary font-semibold mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[11px] text-text-main font-medium">System Synchronized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
