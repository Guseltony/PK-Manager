import NavLinks from "./navLinks";
import { HiLightningBolt } from "react-icons/hi";

const SideBar = () => {
  return (
    <div className="bg-surface-soft w-72 min-h-screen border-r border-white/5 flex flex-col p-6">
      {/* logo */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
          <HiLightningBolt className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight text-text-main">PKM <span className="text-brand-primary">Manager</span></h1>
          <p className="text-[10px] text-text-muted font-medium tracking-[0.2em] uppercase">Knowledge Engine</p>
        </div>
      </div>

      {/* navLinks */}
      <nav className="flex-1">
        <NavLinks />
      </nav>

      {/* footer info placeholder */}
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
