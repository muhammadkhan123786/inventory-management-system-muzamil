import React from "react";
import { LucideIcon, ArrowRight } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  iconBgColor: string;
  topBorderColor: string;
  btnHoverColor: string;
  onAction?: () => void;
  buttonText?: string;
}

export const ActionCard = ({
  title,
  description,
  Icon,
  iconBgColor,
  topBorderColor,
  btnHoverColor,
  onAction,
  buttonText = "Get Started",
}: ActionCardProps) => {
  return (
    <div className="bg-white rounded-4xl p-8 shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col w-full relative overflow-hidden transition-all hover:-translate-y-1 group">
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${topBorderColor}`}
      />

      <div className="flex items-center gap-4 mb-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-linear-to-br ${iconBgColor}`}
        >
          <Icon className="text-white w-7 h-7" strokeWidth={2.5} />
        </div>
        <h3 className="text-[#1E293B] text-xl font-black tracking-tight">
          {title}
        </h3>
      </div>

      <p className="text-[#64748B] text-sm font-medium leading-relaxed mb-8 ">
        {description}
      </p>

      <button
        onClick={onAction}
        className={`
          w-full py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2
          transition-all duration-300 cursor-pointer
          /* Default Styles */
          bg-[#F8FAFF] border border-[#EEF2FF] text-[#4F39F6]
          /* Hover Styles using the prop */
          ${btnHoverColor} hover:text-white hover:shadow-lg
        `}
      >
        {buttonText}
        <ArrowRight
          size={18}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>
  );
};
