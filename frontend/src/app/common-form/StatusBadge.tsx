'use client';

interface StatusBadgeProps {
  isActive?: boolean;
  onChange?: (isActive: boolean) => void;
  editable?: boolean;
}

export const StatusBadge = ({ 
  isActive = false, 
  onChange,
  editable = true 
}: StatusBadgeProps) => {

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    if (!editable) return;
    onChange?.(!isActive);
  };

  return (
    <div
      onClick={handleToggle}
      className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-300 ease-in-out ${
        editable ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'
      } ${isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
          isActive ? 'translate-x-[18px]' : 'translate-x-1'
        }`}
      ></div>
    </div>
  );
};