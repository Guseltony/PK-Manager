import Link from "next/link";
import { FiZap, FiGithub, FiTwitter } from "react-icons/fi";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-surface-soft px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary">
                <FiZap className="text-white" size={16} />
              </div>
              <span className="font-bold text-text-main">
                PK<span className="text-brand-primary">Manager</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-text-muted">
              Your personal knowledge system. Capture, connect, and execute on what
              you know.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted/50">
                Product
              </p>
              <ul className="flex flex-col gap-2.5">
                {["Features", "How It Works", "Changelog"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                      className="text-sm text-text-muted transition-colors hover:text-text-main"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted/50">
                Company
              </p>
              <ul className="flex flex-col gap-2.5">
                {["About", "Contact", "Privacy"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-text-muted transition-colors hover:text-text-main"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-text-muted/50">
            © {new Date().getFullYear()} PKManager. Built with 🧠 by Gusel-OS.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-text-muted/50 transition-colors hover:text-text-muted"
              aria-label="GitHub"
            >
              <FiGithub size={18} />
            </a>
            <a
              href="#"
              className="text-text-muted/50 transition-colors hover:text-text-muted"
              aria-label="Twitter"
            >
              <FiTwitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
