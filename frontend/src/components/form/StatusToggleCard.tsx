"use client";

import React from "react";
import clsx from "clsx";

interface StatusToggleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  activeText: string;
  inactiveText: string;
  accentColor?: "green" | "yellow" | "blue" | "purple";
}

const colorMap = {
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "bg-green-500",
    text: "text-green-600",
    ring: "focus:ring-green-400/40",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "bg-yellow-500",
    text: "text-yellow-600",
    ring: "focus:ring-yellow-400/40",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "bg-blue-500",
    text: "text-blue-600",
    ring: "focus:ring-blue-400/40",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "bg-purple-500",
    text: "text-purple-600",
    ring: "focus:ring-purple-400/40",
  },
};

const StatusToggleCard: React.FC<StatusToggleCardProps> = ({
  icon,
  title,
  description,
  checked,
  onChange,
  activeText,
  inactiveText,
  accentColor = "green",
}) => {
  const colors = colorMap[accentColor];

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 p-4 rounded-xl border transition-all",
        colors.border,
        colors.bg
      )}
    >
      {/* Left */}
      <div className="flex items-start gap-4">
        <div
          className={clsx(
            "w-10 h-10 flex items-center justify-center rounded-xl text-white",
            colors.icon
          )}
        >
          {icon}
        </div>

        <div>
          <h4 className="text-slate-800">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {/* Right */}
      <label className="flex items-center gap-3 cursor-pointer">
        <span
          className={clsx(
            "text-sm font-semibold",
            checked ? colors.text : "text-slate-400"
          )}
        >
          {checked ? activeText : inactiveText}
        </span>

        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={clsx(
            "w-5 h-5 rounded border-gray-300 cursor-pointer",
            "accent-current",
            colors.text,
            "focus:ring-2",
            colors.ring
          )}
        />
      </label>
    </div>
  );
};

export default StatusToggleCard;
