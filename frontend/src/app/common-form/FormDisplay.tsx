import React from "react";

interface Props {
  label: string;
  value?: string;
  placeholder?: string; // 🆕 optional placeholder
}

export const FormDisplay = ({ label, value, placeholder = "N/A" }: Props) => {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        {label}
      </label>

      <div
        className={`w-full h-10 px-3 border border-gray-100 rounded-[10px] text-sm font-bold flex items-center ${
          value ? "bg-gray-100 text-gray-500" : "bg-gray-50 text-gray-400"
        }`}
      >
        {value || placeholder}
      </div>
    </div>
  );
};
