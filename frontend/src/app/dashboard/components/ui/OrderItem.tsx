// components/OrderItem.tsx
import React from 'react';

interface OrderItemProps {
  orderId: string;
  date: string;
  status: 'Pending' | 'Rejected' | 'Completed';
  amount: string;
  variant?: 'compact' | 'detailed';
}

const OrderItem: React.FC<OrderItemProps> = ({ 
  orderId, 
  date, 
  status, 
  amount, 
  variant = 'compact' 
}) => {
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Rejected: 'bg-red-100 text-red-800',
    Completed: 'bg-green-100 text-green-800'
  };

  // Font size classes: Mobile par text-xs ya text-sm, Medium screens par normal
  const textClass = "text-xs md:text-base"; 
  const statusTextClass = "text-[10px] md:text-sm"; // Status badge thora zyada chota rakha hai

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 md:p-4 bg-white hover:bg-gray-50 transition-colors ${textClass}`}>
        <div className="flex-1">
          <span className="font-medium text-gray-900">{orderId}</span>
        </div>
        <div className="flex-1 text-center">
          <span className="text-gray-700">{date}</span>
        </div>
        <div className="flex-1 text-center">
          <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full font-medium ${statusColors[status]} ${statusTextClass}`}>
            {status}
          </span>
        </div>
        <div className="flex-1 text-right">
          <span className="font-bold text-gray-900">{amount}</span>
        </div>
      </div>
    );
  }

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${textClass}`}>
      <td className="py-2 px-4 md:py-4 md:px-6">
        <span className="font-medium text-gray-900">{orderId}</span>
      </td>
      <td className="py-2 px-4 md:py-4 md:px-6 text-center">
        <span className="text-gray-700">{date}</span>
      </td>
      <td className="py-2 px-4 md:py-4 md:px-6 text-center">
        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full font-medium ${statusColors[status]} ${statusTextClass}`}>
          {status}
        </span>
      </td>
      <td className="py-2 px-4 md:py-4 md:px-6 text-right">
        <span className="font-bold text-gray-900">{amount}</span>
      </td>
    </tr>
  );
};

export default OrderItem;