import React from "react";

const PageContainer = ({
  children,
  title,
  description,
  actions,
  className = "",
}) => {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6 ${className}`}>
      {(title || description || actions) && (
        <div className="md:flex md:items-center md:justify-between mb-10 pb-6 border-b border-gray-250">
          <div className="flex-1 min-w-0">
            {title && (
              <h1 className="text-2xl font-black leading-tight text-gray-900 sm:text-3xl tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-4 text-sm font-semibold text-gray-500 max-w-4xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="mt-4 md:mt-0 md:ml-4 flex flex-shrink-0 gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default PageContainer;
