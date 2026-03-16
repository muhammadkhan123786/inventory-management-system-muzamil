'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/form/Card';
import { PurchaseOrderRow } from './PurchaseOrderRow';
import { IPurchaseOrder } from '../types/purchaseOrders';

interface PurchaseOrdersTableProps {
  orders:         IPurchaseOrder[];
  onView:         (order: IPurchaseOrder) => void;
  onEdit:         (order: IPurchaseOrder) => void;
  onDelete:       (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: IPurchaseOrder['status']) => void;
}

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  orders, onView, onEdit, onDelete, onStatusChange
}) => {
  
  if (!orders?.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-center py-12">
        <p className="text-gray-500">No purchase orders found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}>
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <th className="text-left p-4 font-semibold text-gray-700">Order #</th>
                <th className="text-left p-4 font-semibold text-gray-700">Supplier</th>
                <th className="text-left p-4 font-semibold text-gray-700">Order Date</th>
                <th className="text-left p-4 font-semibold text-gray-700">Expected Delivery</th>
                <th className="text-left p-4 font-semibold text-gray-700">Items</th>
                <th className="text-left p-4 font-semibold text-gray-700">Total</th>
                {/* ✅ Delivery Status — auto-derived from date + status */}
                <th className="text-left p-4 font-semibold text-gray-700">Delivery Status</th>
                {/* ✅ PO Status — only "cancel" is manual */}
                <th className="text-left p-4 font-semibold text-gray-700">PO Status</th>
                <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <PurchaseOrderRow
                  key={order._id}
                  order={order}
                  index={index}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};
