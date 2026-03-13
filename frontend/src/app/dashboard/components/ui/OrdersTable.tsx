// components/OrdersTable.tsx
import React from 'react';
import OrderItem from './OrderItem';

// ... (Interfaces same rahengi)
export interface Order {
  id: string;
  orderId: string;
  date: string;
  status: 'Pending' | 'Rejected' | 'Completed';
  amount: string;
}

interface OrdersTableProps {
  orders: Order[];
  title?: string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      
      {/* Table Header: Mobile par 'text-[10px]' aur bade screens par 'text-sm' */}
      <div className="grid grid-cols-4 mx-2 md:mx-4 border-b-[3px] border-[#D9D9D994] text-[#718096] font-semibold text-[10px] md:text-sm uppercase tracking-wider px-3 py-3 md:px-6">
        <div className="text-left">Order ID</div>
        <div className="text-center">Date</div>
        <div className="text-center">Status</div>
        <div className="text-right">Amount</div>
      </div>

      <div className="">
        {orders.map((order) => (
          <OrderItem
            key={order.id}
            orderId={order.orderId}
            date={order.date}
            status={order.status}
            amount={order.amount}
            variant="compact"
          />
        ))}
      </div>
        {/* Optional: Summary */}
      {/* <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Orders: {orders.length}</span>
          <span className="font-semibold text-gray-800">
            Total Amount: {orders[0]?.amount.split('.')[0]}.00
          </span>
        </div>
      </div> */}
    </div>
    
  );
};

export default OrdersTable;