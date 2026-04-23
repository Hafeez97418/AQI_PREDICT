import React from "react";

type NavLink = "Predictor" | "History" | "Analytics";

interface NavbarProps {
  activeTab: NavLink;
  onTabChange: (tab: NavLink) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const links: NavLink[] = ["Predictor", "History", "Analytics"];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-950" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
              </svg>
            </div>
            <span className="font-mono text-sm font-bold tracking-widest text-teal-400 uppercase">AQI·PREDICT</span>
          </div>

          <div className="flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => onTabChange(link)}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200 rounded-md ${activeTab === link
                  ? "text-teal-400"
                  : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {activeTab === link && (
                  <span className="absolute inset-0 rounded-md bg-teal-500/10 border border-teal-500/20" />
                )}
                <span className="relative">{link}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export type { NavLink };
export default Navbar;
