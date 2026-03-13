"use client";
import React from "react";

interface Props {
  label: string;
  checked: boolean | undefined;
  onChange: (val: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const FormToggle = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}: Props) => (
  <label
    className={`flex items-center gap-2 p-4 rounded-xl flex-1 transition-colors
      ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer bg-[#F3F4F6]"}
    `}
  >
    <input
      type="checkbox"
      className={`w-5 h-5 accent-[#155DFC] ${
        disabled ? "" : "cursor-pointer"
      }`}
      checked={!!checked}
      onChange={(e) => {
        if (!disabled) onChange(e.target.checked);
      }}
      disabled={disabled}
    />

    <span className="text-sm font-semibold text-gray-700 select-none">
      {label}
    </span>

    {description && (
      <p className="text-xs text-gray-500 ml-2">{description}</p>
    )}
  </label>
);
