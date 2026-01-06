"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiSolidDashboard, BiSolidNotepad } from "react-icons/bi";
import { BsFillTagFill } from "react-icons/bs";
import { IoMdArchive } from "react-icons/io";
import { NavLink } from "../type/type";

const links: NavLink[] = [
  { href: "/dashboard", name: "dashboard", icon: BiSolidDashboard },
  { href: "/notes", name: "notes", icon: BiSolidNotepad },
  { href: "/tags", name: "tags", icon: BsFillTagFill },
  { href: "/archive", name: "archive", icon: IoMdArchive },
];

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="space-y-4 flex flex-col">
      {links.map(({ href, name, icon: Icon }: NavLink) => (
        <Link
          key={name}
          href={href}
          className={`flex items-center gap-3 px-3 py-2 rounded-md, transition-colors ${
            pathname === href
              ? "bg-[#2225f5] rounded-r-full rounded-l-md"
              : "rounded-md hover:bg-[#6366f1]"
          } `}
        >
          <Icon size={25} />
          <span className="text-xs font-bold uppercase">{name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
