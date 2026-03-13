// components/TaskItem.tsx
import React from 'react';

// ... (Interfaces same rahengi)
interface TaskItemProps {
  taskId: string;
  taskName: string;
  assignedTo: string;
  dueDate: string;
  status: 'Active' | 'Pending' | 'Completed' | 'Overdue';
  variant?: 'compact' | 'detailed';
  onMenuClick?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  taskId, 
  taskName, 
  assignedTo, 
  dueDate, 
  status, 
  variant = 'compact',
  onMenuClick 
}) => {
  const statusColors = {
    Active: 'bg-blue-100 text-blue-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Overdue: 'bg-red-100 text-red-800'
  };

  // Font size classes
  const mainTextClass = "text-xs md:text-base";
  const subTextClass = "text-[10px] md:text-sm";

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 md:p-4 bg-white hover:bg-gray-50 transition-colors ${mainTextClass}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div>
              <p className="font-medium text-gray-900 truncate">{taskName}</p>
              <p className={`${subTextClass} text-gray-500`}>{taskId}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 text-center truncate px-1">
          <span className="font-medium text-[#718096]">{assignedTo}</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-[#718096]">{dueDate}</span>
        </div>
        <div className="flex-1 text-center flex items-center justify-center gap-1 md:gap-2">
          <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full font-medium ${subTextClass} ${statusColors[status]}`}>
            {status}
          </span>
          <button 
            onClick={onMenuClick}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors focus:outline-none"
            aria-label="Options"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 md:h-5 md:w-5 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <circle cx="12" cy="6" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="18" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Detailed variant (Table Row)
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${mainTextClass}`}>
      <td className="py-2 px-4 md:py-4 md:px-6">
        <div>
          <p className="font-medium text-gray-900">{taskName}</p>
          <p className={`${subTextClass} text-gray-500`}>{taskId}</p>
        </div>
      </td>
      <td className="py-2 px-4 md:py-4 md:px-6 text-center">
        <span className="font-medium text-gray-700">{assignedTo}</span>
      </td>
      <td className="py-2 px-4 md:py-4 md:px-6 text-center">
        <span className="text-gray-700">{dueDate}</span>
      </td>
      <td className="py-2 px-4 md:py-4 md:px-6 text-center">
        <div className="flex items-center justify-center gap-1 md:gap-2">
          <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full font-medium ${subTextClass} ${statusColors[status]}`}>
            {status}
          </span>
          <button onClick={onMenuClick} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="6" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="18" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TaskItem;