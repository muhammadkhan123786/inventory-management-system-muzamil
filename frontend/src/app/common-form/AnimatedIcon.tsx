"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedIconProps {
  icon: ReactNode;
  className?: string;
  containerSize?: string; // e.g., "p-3", "p-4"
}

const AnimatedIcon = ({ icon, className = "", containerSize = "p-3" }: AnimatedIconProps) => {
  return (
    <motion.div
      className={`${containerSize} bg-white/20 rounded-2xl backdrop-blur flex justify-center items-center ${className}`}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {icon}
    </motion.div>
  );
};

export default AnimatedIcon;