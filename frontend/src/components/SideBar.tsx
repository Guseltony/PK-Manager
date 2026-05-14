"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import NavLinks from "./navLinks";
import { FiMenu, FiX, FiDownload } from "react-icons/fi";
import { useUIStore } from "../store/uiStore";
import Image from "next/image";


// Helper to subscribe to storage events
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function MobileApkDownload() {
  const isDownloaded = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem("apk-downloaded") === "1",
    () => true // Initial value for server-side rendering
  );

  if (isDownloaded) return null;

  return (
    <a
      href="/downloads/pkm.apk"
      onClick={() => {
        try {
          window.localStorage.setItem("apk-downloaded", "1");
        } catch {}
      }}
      className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
          Download App (APK)
        </p>
        <p className="mt-1 text-xs leading-5 text-text-muted">
          Android install package for mobile and tablets.
        </p>
      </div>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 text-text-main">
        <FiDownload size={16} />
      </span>
    </a>
  );
}

// ============================================================
// Mobile sidebar trigger button
// ============================================================
export function MobileSidebarTrigger() {
  const { toggleMobileSidebar } = useUIStore();
  
  return (
    <button
      onClick={toggleMobileSidebar}
      className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main transition-all border border-white/5"
      aria-label="Open navigation"
    >
      <FiMenu size={18} />
    </button>
  );
}

// ============================================================
// Mobile sidebar drawer component
// ============================================================
export function MobileSidebarDrawer() {
  const { isMobileSidebarOpen: open, setMobileSidebarOpen: setOpen } = useUIStore();

  // Close drawer on route change (using popstate listener as a fallback)
  useEffect(() => {
    const handler = () => setOpen(false);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [setOpen]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-100 lg:hidden animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-surface-soft border-r border-white/5 flex flex-col p-6 z-101 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:hidden ${
          open ? "translate-x-0 overflow-hidden" : "-translate-x-full"
        }`}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between mb-10 px-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <Image src="/pkmlogo.png" alt="PKM Logo" width={36} height={36} className="w-full h-full object-cover" />
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

        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
          <div className="mb-6 px-4">
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-4">Workspace Menu</p>
            <NavLinks onLinkClick={() => setOpen(false)} />
            <MobileApkDownload />
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// Desktop sidebar â€” hidden on mobile
// ============================================================
const SideBar = () => {
  return (
    <div className="hidden lg:flex bg-surface-soft w-64 xl:w-72 h-screen sticky top-0 border-r border-white/5 flex-col p-6 shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 shrink-0">
        <div className="flex items-center justify-center">
          <Image src="/pkmlogo.png" alt="PKM Logo" width={40} height={40} className="w-full h-full object-cover" />
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
    </div>
  );
};

export default SideBar;




