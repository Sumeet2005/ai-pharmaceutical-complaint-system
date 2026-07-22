import React from "react";
import { NavLink } from "react-router-dom";
import { ClipboardList, LayoutDashboard, Home as HomeIcon, X } from "lucide-react";
import { ROUTES } from "src/utils/constants/routes";

const Sidebar = ({ isOpen, onClose }) => {
  const links = [
    { name: "Home", path: ROUTES.HOME, icon: HomeIcon, end: true },
    { name: "Complaint Intake", path: ROUTES.COMPLAINT_INTAKE, icon: ClipboardList },
    { name: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  ];

  const sidebarClasses = `fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white pt-16 transition-transform lg:static lg:translate-x-0 lg:pt-0 ${
    isOpen ? "translate-x-0" : "-translate-x-full"
  }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex justify-end px-4 py-2 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2.5 text-sm font-bold border-l-4 transition-all duration-200 ease-out ${
                    isActive
                      ? "bg-sky-50 text-primary border-primary pl-4 rounded-r-xl font-extrabold shadow-2xs"
                      : "text-gray-600 border-transparent hover:bg-slate-50 hover:text-gray-950 hover:pl-4 pl-3"
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
