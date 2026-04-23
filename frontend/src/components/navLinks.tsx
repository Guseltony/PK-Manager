"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiSolidDashboard, BiSolidNotepad } from "react-icons/bi";
import { BsFillLightbulbFill, BsFillTagFill } from "react-icons/bs";
import { IoMdArchive } from "react-icons/io";
import { FiBook, FiCheckSquare, FiStar, FiActivity, FiZap, FiInbox, FiCalendar, FiShare2, FiTrendingUp, FiLayers, FiSettings } from "react-icons/fi";
import { NavLink } from "../type/type";
import GlobalSearch from "./GlobalSearch";

type NavSection = {
  label: string;
  links: NavLink[];
};

const navSections: NavSection[] = [
  {
    label: "Workspace",
    links: [
      { href: "/inbox", name: "inbox", icon: FiInbox },
      { href: "/dashboard", name: "dashboard", icon: BiSolidDashboard },
      { href: "/ideas", name: "ideas", icon: BsFillLightbulbFill },
      { href: "/notes", name: "notes", icon: BiSolidNotepad },
      { href: "/knowledge", name: "knowledge", icon: FiShare2 },
      { href: "/tag-list", name: "tags", icon: BsFillTagFill },
    ],
  },
  {
    label: "Strategic",
    links: [
      { href: "/dreams", name: "dreams", icon: FiStar },
      { href: "/journal", name: "journal", icon: FiBook },
    ],
  },
  {
    label: "Execution",
    links: [
      { href: "/projects", name: "projects", icon: FiLayers },
      { href: "/tasks", name: "tasks", icon: FiCheckSquare },
      { href: "/calendar", name: "calendar", icon: FiCalendar },
      { href: "/focus", name: "focus", icon: FiZap },
      { href: "/ledger", name: "ledger", icon: FiActivity },
      { href: "/insights", name: "insights", icon: FiTrendingUp },
      { href: "/settings", name: "settings", icon: FiSettings },
    ],
  },
  {
    label: "Library",
    links: [
      { href: "/archive", name: "archive", icon: IoMdArchive },
    ],
  },
];

const NavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-8">
      {navSections.length > 0 ? navSections.map(({ label, links }) => (
        <div key={label} className="flex flex-col gap-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50 px-4 mb-1">
            {label}
          </p>
          <div className="flex flex-col gap-1">
            {links.map(({ href, name, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={onLinkClick}
                  className={`group relative flex cursor-pointer items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-brand-primary/20 text-white"
                      : "text-text-muted hover:bg-white/5 hover:text-text-main"
                  }`}
                >
                  <Icon
                    size={22}
                    className={`shrink-0 transition-all duration-200 ${
                      isActive
                        ? "text-brand-primary scale-110"
                        : "text-text-muted group-hover:text-text-main"
                    }`}
                  />
                  <span className={`text-sm font-bold capitalize tracking-wide ${isActive ? 'text-white' : 'text-text-muted'}`}>
                    {name}
                  </span>
                  {isActive && (
                    <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.7)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )) : (
        <div className="p-4 text-white text-xs opacity-50 italic">
          No navigation links available
        </div>
      )}

      {/* Global Search at bottom of list for mobile ease of use, or kept separate */}
      <div className="px-1 pt-4 border-t border-white/5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/40 px-4 mb-3">COMMAND PALETTE</p>
        <GlobalSearch />
      </div>
    </nav>
  );
};

export default NavLinks;
