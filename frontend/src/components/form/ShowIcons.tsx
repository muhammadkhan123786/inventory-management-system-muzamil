import React from "react";
import { LucideIcon } from "lucide-react";

interface ShowIconProps {
  icon: LucideIcon; 
  size?: number;
  className?: string;
  containerClassName?: string;
  gradientColor?: string;
}

const ShowIcon: React.FC<ShowIconProps> = ({
  icon: Icon, 
  size = 24,
  className = "text-white",
  containerClassName = "",
  gradientColor = "from-[#D622A5] to-[#EB1E63]",
}) => {
  return (
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientColor} 
      flex items-center justify-center shadow-lg ${containerClassName}`}
    >
      {/* Render Icon as a component, not as a variable */}
      <Icon size={size} className={className} />
    </div>
  );
};

export default ShowIcon;