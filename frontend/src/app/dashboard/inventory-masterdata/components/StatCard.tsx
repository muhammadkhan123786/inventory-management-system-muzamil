import React from 'react';
import { LucideIcon } from 'lucide-react';

// Type for icon - can be Lucide icon, SVG component, or React node
type IconType = LucideIcon | React.ComponentType<any> | React.ReactNode;

interface StatCardProps {
  label: string;
  value: number | string;
  subLabel: string;
  icon: IconType;
  badgeText: string;
  gradientClass: string; // e.g., "from-blue-500 to-cyan-400"
  iconSize?: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  subLabel, 
  icon, 
  badgeText, 
  gradientClass,
  iconSize = 28 
}) => {
  // Function to render the icon based on its type
  const renderIcon = () => {
    // Case 1: Lucide Icon (function/component with $typeof)
    if (typeof icon === 'object' && icon !== null && 'render' in icon) {
      // This is a Lucide icon component
      const IconComponent = icon as any;
      return <IconComponent size={iconSize} className="opacity-90" />;
    }
    
    // Case 2: Function component
    if (typeof icon === 'function') {
      const IconComponent = icon as LucideIcon;
      return <IconComponent size={iconSize} className="opacity-90" />;
    }
    
    // Case 3: React Node (JSX Element - custom SVG)
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<any>, {
        width: iconSize,
        height: iconSize,
        className: `opacity-90 ${(icon as any).props?.className || ''}`,
      });
    }
    
    // Case 4: Fallback - render as is
    return null;
  };

  return (
    <div 
      className={`p-5 rounded-3xl shadow-lg bg-gradient-to-br ${gradientClass} text-white flex flex-col justify-between min-h-[160px] flex-1`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-shrink-0">
          {renderIcon()}
        </div>
        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {badgeText}
        </span>
      </div>
      <div>
        <h2 className="text-4xl font-bold mt-2">{value}</h2>
        <p className="text-sm opacity-90 font-medium">{subLabel}</p>
      </div>
    </div>
  );
};

export default StatCard;


// ============================================
// 📦 USAGE EXAMPLES
// ============================================

/*

// Example 1: Using Lucide Icons
import { Users, ShoppingCart, DollarSign } from 'lucide-react';

<StatCard
  label="Total Users"
  value={1234}
  subLabel="Active Users"
  icon={Users}
  badgeText="Users"
  gradientClass="from-blue-500 to-cyan-400"
/>


// Example 2: Using Custom SVG Component
const CustomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

<StatCard
  label="Projects"
  value={42}
  subLabel="Active Projects"
  icon={CustomIcon}
  badgeText="Projects"
  gradientClass="from-purple-500 to-pink-400"
/>


// Example 3: Using Inline SVG JSX
<StatCard
  label="Revenue"
  value="$45.2K"
  subLabel="Monthly Revenue"
  icon={
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  }
  badgeText="Revenue"
  gradientClass="from-emerald-500 to-teal-400"
/>


// Example 4: Using SVG from a file
import { ReactComponent as ChartIcon } from './icons/chart.svg';

<StatCard
  label="Analytics"
  value="95%"
  subLabel="Performance"
  icon={<ChartIcon />}
  badgeText="Analytics"
  gradientClass="from-orange-500 to-red-500"
/>


// Example 5: Custom Icon Size
<StatCard
  label="Orders"
  value={567}
  subLabel="Pending Orders"
  icon={ShoppingCart}
  badgeText="Orders"
  gradientClass="from-indigo-500 to-purple-400"
  iconSize={32}  // Custom size
/>

*/