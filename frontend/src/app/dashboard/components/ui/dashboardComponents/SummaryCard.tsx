import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  iconBgColor?: string;
}

export const SummaryCard = ({
  label,
  value,
  Icon,
  iconBgColor = "from-purple-500 to-indigo-600",
}: SummaryCardProps) => {
  return (
    <div
      className="
      bg-white rounded-4xl px-5 py-7 flex items-center gap-4 w-full
      border border-gray-100 shadow-sm
      transition-transform duration-300 ease-out
      hover:scale-[1.02] cursor-pointer group
    "
    >
      <div
        className={`
        p-3.5 rounded-2xl shadow-md bg-linear-to-br ${iconBgColor}
        transition-transform duration-300 group-hover:rotate-3
      `}
      >
        <Icon className="text-white w-6 h-6" />
      </div>

      <div className="flex flex-col">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wide">
          {label}
        </span>

        <span className="text-slate-900 text-2xl font-bold mt-0.5">
          {value}
        </span>
      </div>
    </div>
  );
};
