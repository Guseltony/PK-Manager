"use strict";
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FiInbox,
  FiCheckSquare,
  FiMenu 
} from "react-icons/fi";
import { BiSolidDashboard, BiSolidNotepad } from "react-icons/bi";
import { useUIStore } from "../store/uiStore";

export default function BottomNav() {
  const pathname = usePathname();

  const { toggleMobileSidebar } = useUIStore();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: BiSolidDashboard },
    { label: "Inbox", href: "/inbox", icon: FiInbox },
    { label: "Notes", href: "/notes", icon: BiSolidNotepad },
    { label: "Tasks", href: "/tasks", icon: FiCheckSquare },
  ];

  // Don't show bottom nav on sign-in page or similar routes if needed
  if (pathname === "/sign-in" || pathname === "/onboarding" || pathname === "/") return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-soft/90 backdrop-blur-md border-t border-border pb-safe pb-env-[safe-area-inset-bottom]">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-brand-primary" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Icon size={22} className={isActive ? "fill-brand-primary/20" : ""} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* MORE BUTTON - Opens Sidebar */}
        <button
          onClick={toggleMobileSidebar}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-text-muted hover:text-text-main"
        >
          <FiMenu size={22} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </div>
  );
}
