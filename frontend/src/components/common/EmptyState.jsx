import React from "react";
import { FolderOpen } from "lucide-react";

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No data found",
  description = "There are no records available to display at this time.",
  action,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-300 rounded-xl bg-white ${className}`}>
      <div className="p-3 bg-gray-50 rounded-full text-gray-400 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
