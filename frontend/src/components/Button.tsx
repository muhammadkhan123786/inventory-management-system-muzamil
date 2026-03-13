import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'white' | 'primary' | 'outline';
}

const Button = ({ 
  children, 
  icon: Icon, 
  iconPosition = 'left', 
  variant = 'white', 
  className = '', 
  ...props 
}: ButtonProps) => {
  
  // Base professional styles
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95";
  
  // Specific Shadow and Color logic based on your images
  const variants = {
    // Ye variant aapke "Print Labels" aur "Save Draft" ke liye hai
    white: "bg-white text-[#1e293b] border border-gray-100 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0px_6px_16px_rgba(0,0,0,0.08)] dark:bg-slate-900 dark:border-white/10 dark:text-white",
    
    // Ye variant "Complete Receipt" orange button ke liye hai
    primary: "bg-[#f97316] text-white shadow-[0px_8px_20px_rgba(249,115,22,0.2)] hover:bg-[#ea580c] dark:bg-blue-600 dark:shadow-blue-500/20",
    
    // Ye variant "Cancel" button ke liye hai
    outline: "bg-transparent border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-gray-400"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={18} className="flex-shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={18} className="flex-shrink-0" />}
    </button>
  );
};

export default Button;