"use client";

import React from "react";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  success?: boolean;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, icon: Icon, success, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-fg">{label}</label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon className="w-5 h-5 text-muted" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 ${Icon ? "pl-10" : "pl-4"} 
              rounded-lg border 
              ${error ? "border-destructive" : "border-input"}
              bg-card text-fg
              placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
              disabled:bg-muted disabled:cursor-not-allowed
              ${success && !error ? "border-chart-2" : ""}
              ${className}
            `}
            {...props}
          />
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-chart-2">
              ✓
            </div>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  required,
  error,
  id,
  className,
  ...props
}) => {
  const inputId = id || label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input */}
      <input
        id={inputId}
        className={clsx(
          "w-full rounded-xl px-4 py-[6px] bg-slate-100 transition-all duration-200",
          "border border-transparent", 
          "outline-none", 
          "focus:border-purple-900 focus:ring-4 focus:ring-purple-900/20", 
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />

      {/* Error */}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default TextInput;
