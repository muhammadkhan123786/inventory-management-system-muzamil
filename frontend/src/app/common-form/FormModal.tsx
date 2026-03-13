"use client";
import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  themeColor: string;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export const FormModal = ({
  title,
  icon,
  onClose,
  themeColor,
  children,
  width = "max-w-lg",
  className = "",
}: ModalProps) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div
      className={`bg-white rounded-2xl w-full ${width} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
    >
      {/* Header Section - Background Removed */}
      <div className="p-6 pb-2 flex justify-between items-start">
        <div className="flex items-center gap-4">
          {/* Icon with Theme Background Box */}
          <div
            className="p-3 rounded-2xl flex items-center justify-center text-white shadow-sm"
            style={{ background: themeColor }}
          >
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 })
              : icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b]">
              {title}
            </h2>
            
          </div>
          
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
        >
          <X size={22} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 pt-2 max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);