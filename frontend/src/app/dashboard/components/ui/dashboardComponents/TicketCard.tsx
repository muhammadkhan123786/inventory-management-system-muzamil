import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  percentage: string;
  Icon: LucideIcon;
  iconBgColor?: string;
  percentageColor?: string;
  cardBgColor?: string;
}

const StatCard = ({
  title,
  percentage,
  Icon,
  iconBgColor = "from-orange-400 to-red-500",
  percentageColor = "text-green-600",
  cardBgColor = "bg-white",
}: StatCardProps) => {
  const isNegative = percentage.startsWith("-");

  const getShadowStyle = () => {
    if (cardBgColor.includes("orange"))
      return "hover:shadow-[0_15px_30px_-10px_rgba(255,165,0,0.2)]";
    if (cardBgColor.includes("cyan"))
      return "hover:shadow-[0_15px_30px_-10px_rgba(6,182,212,0.2)]";
    if (cardBgColor.includes("green"))
      return "hover:shadow-[0_15px_30px_-10px_rgba(34,197,94,0.2)]";
    if (cardBgColor.includes("rose"))
      return "hover:shadow-[0_15px_30px_-10px_rgba(244,63,94,0.2)]";
    return "hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.08)]";
  };

  return (
    <div
      className={`
        ${cardBgColor}
        rounded-4xl p-6 w-full
        border border-white/60
        shadow-[0_4px_20px_rgba(0,0,0,0.02)]
        transition-all duration-300 ease-out
        ${getShadowStyle()}
        hover:scale-[1.02]
        hover:-translate-y-1
        cursor-pointer
        group
      `}
    >
      <div className="flex justify-between items-start mb-10">
        <div
          className={`p-4 rounded-2xl shadow-lg bg-linear-to-br ${iconBgColor} transition-transform duration-500 group-hover:rotate-3`}
        >
          <Icon className="text-white w-6 h-6" />
        </div>

        <div
          className={`flex items-center gap-1 font-bold text-base ${percentageColor}`}
        >
          {isNegative ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
          <span>{percentage}</span>
        </div>
      </div>

      <h3 className="text-[#5A607F] text-lg font-semibold tracking-tight">
        {title}
      </h3>
    </div>
  );
};

export default StatCard;
