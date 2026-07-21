import React, { forwardRef } from "react";

const Input = forwardRef(({
  label,
  type = "text",
  error,
  className = "",
  rows,
  ...props
}, ref) => {
  const inputClass = `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
    error ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-primary"
  } ${className}`;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          ref={ref}
          rows={rows || 4}
          className={inputClass}
          {...props}
        />
      ) : (
        <input
          ref={ref}
          type={type}
          className={inputClass}
          {...props}
        />
      )}
      {error && (
        <span className="text-xs text-red-600 font-medium">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
