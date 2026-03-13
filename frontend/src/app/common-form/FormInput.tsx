import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = ({ label, error, ...props }: Props) => (
  <div>
    <label className="block text-sm font-semibold mb-2 text-gray-700">
      {label}
    </label>

    <input
      {...props}
      className={`w-full border rounded-xl bg-[#F3F4F6] p-3 outline-none focus:ring-2 transition-all
        ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-200 focus:border-[#FE6B1D]"
        }
      `}
    />

    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
