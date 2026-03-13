// import React from "react";
// import { LucideIcon } from "lucide-react";
// import ProgressBar from "@/components/form/ProgressBar";
// import { StatCardProgress } from "../types/StatCardTypes";

// export interface StatCardProps {
//   title?: string;
//   value?: string | number;
//   subtitle?: string;
//   icon?: LucideIcon;
//   iconColor? : string;
//   iconPosition?: string; 
//   color?: string;
//   gradientClass?: string;
//   trendIcon?: React.ReactNode;
//   progress?: StatCardProgress;
//   description?: string;
//   showValueWithProgress?: boolean;
// }

// const StatCard = ({
//   title,
//   value,
//   subtitle,
//   icon: Icon,
 
//   iconPosition = 'left', 
//   color,
//   trendIcon,
//   gradientClass = "",
//   progress,
//   description,
//   showValueWithProgress = false,
// }: StatCardProps) => {
//   const hasProgress = progress !== undefined;
//   const shouldShowValueText = showValueWithProgress && hasProgress;

//   // 3. EXTRACTION: Move the Icon UI to a reusable variable for clean rendering
//   const IconComponent = Icon && (
//     <div
//       className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm flex-shrink-0"
//       style={{ backgroundColor: `${color}20` }}
//     >
//       <Icon size={20} style={{ color: color }} />
//     </div>
//   );

//   return (
//     <div
//       className={`
//         relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md
//         border-border
//         bg-linear-to-r from-card ${gradientClass} 
//         dark:from-card dark:to-card/80
//       `}
//     >
//       <div className="relative z-10 flex items-start gap-3">
        
//         {/* 4. LOGIC: Render Icon on the LEFT if position is 'left' */}
//         {iconPosition === 'left' && IconComponent}

//         <div className="flex-1 min-w-0">
//           <p className="text-[14px] font-medium text-muted mb-1">{title}</p>

//           <div className="flex items-baseline gap-2">
//             <h3 className="text-xl flex items-center justify-center gap-2 text-fg truncate">
//               <span className="font-bold">{value}</span>
//               <span>
//                 {description && <p className="text-[8px]">{description}</p>}
//               </span>
//             </h3>

//             {shouldShowValueText && (
//               <span className="text-sm font-semibold text-primary">
//                 {progress.labelText
//                   ? ` (${progress.labelText})`
//                   : ` (${Math.round(progress.value || 0)}%)`}
//               </span>
//             )}
//           </div>

//           {subtitle && (
//             <p className="text-[12px] text-muted mt-1">{subtitle}</p>
//           )}

//           {progress && (
//             <div className="relative z-10 mt-4">
//               <ProgressBar
//                 value={progress.value}
//                 max={progress.max}
//                 trackColor={progress.trackColor}
//                 progressColor={progress.progressColor}
//                 height={progress.height}
//                 borderRadius={progress.borderRadius}
//                 labelText={progress.labelText}
//                 showLabel={
//                   progress.showLabel && progress.labelPosition !== "top-center"
//                 }
//                 labelPosition={
//                   progress.labelPosition === "top-center"
//                     ? "none"
//                     : progress.labelPosition
//                 }
//               />
//             </div>
//           )}
//         </div>

//         {/* 5. LOGIC: Render Icon on the RIGHT if position is 'right' */}
//         {iconPosition === 'right' && IconComponent}

//       </div>
//     </div>
//   );
// };

// export default StatCard;



import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor: string;
  iconBgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, borderColor, iconBgColor }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border-t-4 ${borderColor} p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${iconBgColor} rounded-full p-3 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;