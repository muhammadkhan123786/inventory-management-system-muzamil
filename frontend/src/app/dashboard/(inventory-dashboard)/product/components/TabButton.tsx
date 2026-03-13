"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/form/CustomButton";



interface TabButtonProps {
  active: boolean;
  icon: any;
  title: string;
  subtitle: string;
  onClick: () => void;
  gradient: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  active,
  icon: Icon,
  title,
  subtitle,
  onClick,
  gradient,
}) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Button
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      className={`w-full h-auto py-4 px-6 gap-3 transition-all duration-300 ${
        active
          ? `bg-gradient-to-br ${gradient} hover:from-opacity-90 hover:via-opacity-90 hover:to-opacity-90 text-white shadow-xl border-2 border-white/20`
          : "hover:bg-gray-50 text-gray-700 hover:shadow-lg"
      }`}
    >
      <div className="flex flex-col items-center gap-2 w-full">
        <motion.div
          animate={active ? { rotate: [0, 360] } : {}}
          transition={
            active ? { duration: 2, repeat: Infinity, ease: "linear" } : {}
          }
          className={`p-3 rounded-xl ${active ? "bg-white/20 backdrop-blur-sm" : "bg-gray-100"}`}
        >
          <Icon
            className={`h-6 w-6 ${active ? "text-white" : "text-gray-600"}`}
          />
        </motion.div>
        <div className="text-center">
          <div
            className={`font-bold text-base ${active ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </div>
          <div
            className={`text-xs mt-0.5 ${active ? "text-white/80" : "text-gray-500"}`}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </Button>
  </motion.div>
);