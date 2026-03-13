"use client";
import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
  loading?: boolean;
  themeColor: string;
  onCancel?: () => void; // Added for the Cancel button functionality
}

export const FormButton = ({
  label,
  icon,
  loading,
  themeColor,
  onCancel,
  ...props
}: ButtonProps) => {
  // If onCancel is provided, we show the split design (Cancel + Action)
  if (onCancel) {
    return (
      <div className="flex justify-end items-center gap-2 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          {...props}
          disabled={loading || props.disabled}
          className="px-5 py-2 rounded-xl font-bold text-white shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ background: themeColor }}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : icon}
          {loading ? "Processing..." : label}
        </button>
      </div>
    );
  }

  // Fallback to original full-width design if no onCancel is provided
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: themeColor }}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : icon}
      {loading ? "Processing..." : label}
    </button>
  );
};