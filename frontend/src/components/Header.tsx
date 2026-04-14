"use client";

import { IoMdSettings } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import SignOut from "../utils/SignOut";
import { AuthResult } from "../libs/auth";
import { MobileSidebarTrigger } from "./SideBar";

const Header = ({ auth }: { auth: AuthResult }) => {
  const { authenticated, user } = auth;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-surface-base/80 px-4 md:px-6 backdrop-blur-md gap-4">
      <div className="flex items-center gap-3 lg:hidden">
        <MobileSidebarTrigger />
        <span className="text-sm font-display font-bold text-text-main lg:hidden">
          PKM <span className="text-brand-primary">Manager</span>
        </span>
      </div>

      {/* Spacer for desktop (sidebar takes the space) */}
      <div className="hidden lg:block flex-1" />

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-soft hover:text-text-main transition-all">
            <IoIosNotifications size={20} />
          </button>
          <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-soft hover:text-text-main transition-all">
            <IoMdSettings size={20} />
          </button>
        </div>

        <div className="h-6 w-px bg-white/5" />

        {/* User Profile */}
        {authenticated ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-text-main leading-none">{user?.name}</span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Free Plan</span>
            </div>
            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/5 bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
              <FaRegUser className="text-brand-primary" size={16} />
            </div>
            <SignOut />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center">
            <FaRegUser className="text-text-muted" size={16} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
