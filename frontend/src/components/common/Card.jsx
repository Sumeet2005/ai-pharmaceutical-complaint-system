import React from "react";

const Card = ({
  children,
  className = "",
  title,
  subtitle,
  headerAction,
  footer,
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 leading-6">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
