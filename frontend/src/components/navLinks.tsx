"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiSolidDashboard, BiSolidNotepad } from "react-icons/bi";
import { BsFillTagFill } from "react-icons/bs";
import { IoMdArchive } from "react-icons/io";
import {
  FiTarget,
  FiBook,
  FiCheckSquare,
  FiStar,
} from "react-icons/fi";
import { NavLink } from "../type/type";

type NavSection = {
  label: string;
  links: NavLink[];
};

const navSections: NavSection[] = [
  {
    label: "Workspace",
    links: [
      { href: "/dashboard", name: "dashboard", icon: BiSolidDashboard },
      { href: "/notes", name: "notes", icon: BiSolidNotepad },
      { href: "/tags", name: "tags", icon: BsFillTagFill },
    ],
  },
  {
    label: "Productivity",
    links: [
      { href: "/tasks", name: "tasks", icon: FiCheckSquare },
      { href: "/goals", name: "goals", icon: FiTarget },
    ],
  },
  {
    label: "Reflect",
    links: [
      { href: "/journal", name: "journal", icon: FiBook },
      { href: "/dreams", name: "dreams", icon: FiStar },
    ],
  },
  {
    label: "Library",
    links: [
      { href: "/archive", name: "archive", icon: IoMdArchive },
    ],
  },
];

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {navSections.map(({ label, links }) => (
        <div key={label}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted/50 px-4 mb-1.5">
            {label}
          </p>
          <div className="flex flex-col gap-0.5">
            {links.map(({ href, name, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={name}
                  href={href}
                  className={`group relative flex cursor-pointer items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-text-muted hover:bg-white/5 hover:text-text-main"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? "text-brand-primary"
                        : "text-text-muted group-hover:text-text-main"
                    }`}
                  />
                  <span className="text-sm font-medium capitalize tracking-wide">
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
      ))}
    </nav>
  );
};

export default NavLinks;
