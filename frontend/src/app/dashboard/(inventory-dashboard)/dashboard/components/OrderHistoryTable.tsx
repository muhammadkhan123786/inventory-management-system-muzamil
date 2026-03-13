// src/app/orders/page.tsx
'use client';

import CustomTable from '@/components/CustomTable';
import DropdownMenu from './DropdownMenu';
import { ChevronRight } from 'lucide-react';

// Data Type
interface Order {
  id: string;
  customer: string;
  date: string;
  channel: string;
  total: string;
  status: 'Pending' | 'Completed' | 'Canceled';
}

export default function OrderPage() {
  const orders: Order[] = [
    { id: '#657946', customer: 'David Jhon', date: '27 Mar 2025', channel: 'Shopify', total: '£ 873', status: 'Pending' },
    { id: '#657947', customer: 'Sarah Smith', date: '27 Mar 2025', channel: 'Direct', total: '£ 1,245', status: 'Completed' },
    { id: '#657948', customer: 'Mike Johnson', date: '26 Mar 2025', channel: 'Retail', total: '£ 456', status: 'Canceled' },
    { id: '#657949', customer: 'Emma Wilson', date: '26 Mar 2025', channel: 'Shopify', total: '£ 2,100', status: 'Completed' },
    { id: '#657950', customer: 'James Brown', date: '25 Mar 2025', channel: 'Direct', total: '£ 789', status: 'Pending' },
  ];

  // Handle Edit
  const handleEdit = (order: Order) => {
    console.log('Edit order:', order);
    // Add your edit logic here
    alert(`Edit order ${order.id} for ${order.customer}`);
  };

  // Handle Delete
  const handleDelete = (order: Order) => {
    console.log('Delete order:', order);
    // Add your delete logic here
    if (confirm(`Are you sure you want to delete order ${order.id}?`)) {
      alert(`Deleted order ${order.id}`);
    }
  };

  const columns = [
    { header: 'Order ID', accessor: 'id' as const },
    { header: 'Customer', accessor: 'customer' as const },
    { header: 'Date', accessor: 'date' as const },
    { header: 'Channel', accessor: 'channel' as const },
    { header: 'Total', accessor: 'total' as const },
    { 
      header: 'Status', 
      accessor: (item: Order) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold
          ${item.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-500' : ''}
          ${item.status === 'Completed' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : ''}
          ${item.status === 'Canceled' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : ''}
        `}>
          {item.status}
        </span>
      )
    },
    { 
      header: 'Action', 
      accessor: (item: Order) => (
        <DropdownMenu
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        />
      )
    },
  ];

  return (
    <div className="mt-6 bg-gray-50 dark:bg-slate-950 min-h-screen">
      <CustomTable 
        title="Order History" 
        data={orders} 
        columns={columns} 
        headerAction={
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-colors">
            View All <ChevronRight size={16}/>
          </button>
        }
      />
    </div>
  );
}