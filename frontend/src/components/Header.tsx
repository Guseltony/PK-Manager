import { IoMdSettings } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import SignOut from "../utils/SignOut";
import { AuthResult } from "../libs/auth";

const Header = async ({ auth }: { auth: AuthResult }) => {
  const { authenticated, user } = auth;
  const name = user?.name.split(" ")[0] || "User";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-surface-base/80 px-8 backdrop-blur-md">
      {/* Search Bar */}
      <div className="relative max-w-md w-full group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <BiSearch className="h-5 w-5 text-text-muted group-focus-within:text-brand-primary transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full rounded-xl border border-white/5 bg-surface-soft py-2 pl-10 pr-3 text-sm text-text-main placeholder:text-text-muted transition-all focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 outline-none"
          placeholder="Quick search (Ctrl + K)"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-soft hover:text-text-main transition-all">
            <IoIosNotifications size={20} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-soft hover:text-text-main transition-all">
            <IoMdSettings size={20} />
          </button>
        </div>

        <div className="h-6 w-px bg-white/5" />

        {/* User Profile */}
        {authenticated ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-text-main leading-none">{user?.name}</span>
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Free Plan</span>
            </div>
            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/5 bg-brand-primary/20 flex items-center justify-center">
               <FaRegUser className="text-brand-primary" size={18} />
            </div>
            <SignOut />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center">
            <FaRegUser className="text-text-muted" size={18} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
