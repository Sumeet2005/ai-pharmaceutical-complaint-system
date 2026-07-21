import React from "react";
import { ShieldCheck, Menu, User } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-xs sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none sm:text-lg">
              PharmacoGuard
            </h1>
            <span className="text-[10px] font-medium text-gray-500 tracking-wider uppercase">
              AI Complaint System
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 p-1.5 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden text-xs font-semibold text-gray-700 sm:inline-block">
            QA Administrator
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
