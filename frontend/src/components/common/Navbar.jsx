import React from "react";
import { ShieldCheck, Menu, User } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-2xs sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-primary border border-sky-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 tracking-tight leading-none sm:text-base">
              PharmacoGuard
            </h1>
            <span className="text-[9px] font-black text-gray-400 tracking-wider uppercase block mt-0.5">
              AI Complaint System
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1 pr-3.5 h-9">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold shrink-0">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden text-xs font-bold text-gray-750 sm:inline-block">
            QA Administrator
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
