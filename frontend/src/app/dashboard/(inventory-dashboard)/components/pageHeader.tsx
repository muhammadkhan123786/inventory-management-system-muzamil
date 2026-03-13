
import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; 
  className?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, children, className = '' }, ref) => {
    const baseStyles = `
      flex items-center justify-between gap-4 mb-6 pb-4
    `.trim().replace(/\s+/g, ' ');

    return (
       <div className="bg-gray-50 p-8 dark:bg-slate-950">
      <div ref={ref} className={`${baseStyles} ${className}`}>
        {/* Left Side - Title & Subtitle */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side - Action Buttons */}
        {children && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export default PageHeader;