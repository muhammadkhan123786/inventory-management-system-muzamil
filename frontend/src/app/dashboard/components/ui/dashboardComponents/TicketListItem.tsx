import { ArrowRight } from "lucide-react";

interface TicketListItemProps {
  ticketId: string;
  status: string;
  statusColor: string;
  priority: string;
  priorityColor: string;
  customerName: string;
  equipment: string;
  description: string;
  date: string;
  category: string;
}

export const TicketListItem = ({
  ticketId,
  status,
  statusColor,
  priority,
  priorityColor,
  customerName,
  equipment,
  description,
  date,
  category,
}: TicketListItemProps) => {
  return (
    <div
      className="
      bg-white rounded-3xl p-6 w-full
      border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)]
      transition-all duration-300 ease-in-out
      hover:border-indigo-100 hover:scale-[1.01]
      group cursor-pointer hover:bg-gray-50
    "
    >
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#8B5CF6] font-bold text-xs">{ticketId}</span>
            <span
              className={`${statusColor} text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase  tracking-wider`}
            >
              {status}
            </span>
            <span
              className={`${priorityColor} text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider`}
            >
              {priority}
            </span>
          </div>

          <h4 className="text-[#1E293B] font-bold text-lg leading-tight">
            {customerName}{" "}
            <span className="mx-1 font-medium text-slate-300">—</span>{" "}
            {equipment}
          </h4>

          <p className="text-slate-400 text-sm font-medium line-clamp-1">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-4 ml-6">
          <div className="flex flex-col items-end justify-between h-full space-y-3">
            <span className="text-slate-500 text-sm font-bold tracking-tight">
              {date}
            </span>

            <div className="bg-[#EEF2FF] px-4 py-1 rounded-full">
              <span className="text-[#6366F1] text-[10px] font-black uppercase tracking-widest">
                {category}
              </span>
            </div>
          </div>

          <div className="flex items-center self-center h-full">
            <ArrowRight
              className="text-slate-400 group-hover:text-indigo-400 transition-all group-hover:translate-x-1"
              size={18}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
