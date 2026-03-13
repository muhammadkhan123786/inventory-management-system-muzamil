"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface RotatingIconProps {
  // Allow both the Component type and the rendered Element type
  icon: LucideIcon | React.ReactNode; 
  containerClassName?: string;
  iconClassName?: string;
}

const RotatingIcon: React.FC<RotatingIconProps> = ({ 
  icon: Icon, 
  containerClassName = "", 
  iconClassName = "" 
}) => {

  // Helper function to render the icon correctly based on its type
  const renderIcon = () => {
    if (!Icon) return null;

    // If Icon is a function (a Lucide component definition)
    if (typeof Icon === 'function') {
      return <Icon className={iconClassName} />;
    }

    // If Icon is an object (a JSX element like <svg />)
    return (
      <div className={iconClassName}>
        {Icon}
      </div>
    );
  };

  return (
    <div className={`relative flex items-center justify-center rounded-2xl ${containerClassName}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="flex items-center justify-center"
      >
        {renderIcon()}
      </motion.div>
    </div>
  );
};

export default RotatingIcon;