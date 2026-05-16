"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { 
  FiUser, 
  FiLogOut, 
  FiMoon, 
  FiSun, 
  FiMonitor, 
  FiChevronDown,
  FiSettings,
  FiCheck
} from "react-icons/fi";
import Link from "next/link";
import { AuthResult } from "../libs/auth";
import { logout } from "../libs/api";

export default function UserDropdown({ auth }: { auth: AuthResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = auth;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/sign-in";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const themes = [
    { id: "light", label: "Light", icon: <FiSun /> },
    { id: "dark", label: "Dark", icon: <FiMoon /> },
    { id: "system", label: "System", icon: <FiMonitor /> },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl p-1.5 transition-all hover:bg-surface-soft active:scale-95"
      >
        <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-border/50 bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          {user?.avatar ? (
             <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <FiUser className="text-brand-primary" size={18} />
          )}
        </div>
        <div className="hidden md:flex flex-col items-start pr-1">
          <span className="text-sm font-semibold text-text-main leading-none">
            {user?.name?.split(" ")[0]}
          </span>
          <FiChevronDown className={`text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} size={12} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface-soft p-2 shadow-2xl backdrop-blur-xl z-50"
          >
            {/* User Info */}
            <div className="mb-2 px-3 py-3 border-b border-border">
              <p className="text-sm font-bold text-text-main truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-surface-mutes/50 hover:text-text-main"
              >
                <FiUser size={16} />
                Profile Settings
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-surface-mutes/50 hover:text-text-main"
              >
                <FiSettings size={16} />
                App Preferences
              </Link>
            </div>

            <div className="my-2 h-px bg-surface-mutes/50" />

            {/* Theme Toggle */}
            <div className="px-3 py-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted/60">Appearance</p>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface-base p-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                      theme === t.id 
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                        : "text-text-muted hover:bg-surface-mutes/50 hover:text-text-main"
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span className="text-[10px] font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="my-2 h-px bg-surface-mutes/50" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-400 transition-all hover:bg-red-500/10 active:scale-95"
            >
              <FiLogOut size={16} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
