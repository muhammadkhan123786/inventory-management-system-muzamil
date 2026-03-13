import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
  fullWidth?: boolean;
  // Allows passing custom tailwind classes for height, width, or colors
  className?: string; 
  type?: 'button' | 'submit' | 'reset';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  
  // Base styles matching the rounded, professional look of your UI
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl";
  
  // Design-specific variants
  const variants = {
    // Exact gradient from your "Add Category" button
    primary: "bg-gradient-to-r from-[#A825EE] via-[#D622A5] to-[#EB1E63] text-white shadow-md hover:shadow-lg hover:opacity-90",
    // Exact style for the "Cancel" button
    secondary: "bg-[#F8FAFF] border border-[#E0E7FF] text-[#334155] hover:bg-[#F1F5F9]",
    outline: "border-2 border-purple-500 text-purple-600 hover:bg-purple-50",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm", // Matches your image
    lg: "px-8 py-3 text-base",
  };
console.log("type", type);
  return (
    <button
    {...props}
       type={type}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={isLoading || disabled}
     
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : Icon ? (
        <Icon className="mr-2 h-4 w-4" />
      ) : null}
      {children}
    </button>
  );
};

export default CustomButton;