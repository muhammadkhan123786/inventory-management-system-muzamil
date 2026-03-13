import { LucideIcon, TrendingUp } from "lucide-react";

interface RevenueCardProps {
  title: string;
  amount: string;
  percentage: string;
  Icon: LucideIcon;
  iconBgColor: string;
  cardBgColor: string;
  shadowColor: string;
}

export const RevenueCard = ({
  title,
  amount,
  percentage,
  Icon,
  iconBgColor,
  cardBgColor,
  shadowColor,
}: RevenueCardProps) => {
  return (
    <div
      className={`
        ${cardBgColor} rounded-4xl p-6 w-full
        border border-white/60
        shadow-[0_10px_30px_rgba(0,0,0,0.02)]
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1
        ${shadowColor}
        cursor-pointer group
      `}
    >
      <div className="flex justify-between items-start mb-8">
        <div
          className={`
            w-14 h-14 rounded-2xl flex items-center justify-center
            shadow-lg bg-linear-to-br ${iconBgColor}
            transition-transform duration-500 group-hover:rotate-3
          `}
        >
          <Icon className="text-white w-7 h-7" strokeWidth={2.5} />
        </div>

        <div className="flex items-center gap-1 font-bold text-base text-green-600">
          <TrendingUp size={18} />
          <span>{percentage}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[#5A607F] text-lg font-medium tracking-tight">
          {title}
        </h3>

        <div className="text-[#5A607F] text-base font-semibold opacity-90">
          Revenue:{" "}
          <span className="ml-1 text-[#1E293B] font-bold">{amount}</span>
        </div>
      </div>
    </div>
  );
};
