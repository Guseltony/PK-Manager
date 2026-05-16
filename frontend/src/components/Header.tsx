"use client";

import Link from "next/link";
import { IoMdSettings } from "react-icons/io";
import { FiTarget } from "react-icons/fi";
import { AuthResult } from "../libs/auth";
import PwaInstallIcon from "./PwaInstallIcon";
import NotificationDropdown from "./NotificationDropdown";
import Image from "next/image";
import UserDropdown from "./UserDropdown";
import { useUIStore } from "../store/uiStore";

const Header = ({ auth }: { auth: AuthResult }) => {
  const { setCaptureModalOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-surface-base/80 px-4 md:px-6 backdrop-blur-md gap-4">
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/pkmlogo.png"
            alt="PKM"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-lg object-cover"
          />
        </Link>
      </div>

      {/* Spacer for desktop (sidebar takes the space) */}
      <div className="hidden lg:block flex-1" />

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCaptureModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 mr-1"
            aria-label="Universal Capture"
          >
            <FiTarget size={20} />
          </button>
          <NotificationDropdown />
          <PwaInstallIcon />
          <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-soft hover:text-text-main transition-all">
            <IoMdSettings size={20} />
          </button>
        </div>

        <div className="h-6 w-px bg-white/5" />

        {/* User Profile Dropdown */}
        <UserDropdown auth={auth} />
      </div>
    </header>
  );
};

export default Header;
