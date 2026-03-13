'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { GRNRow } from './GRNRow';
import { GoodsReceivedNote } from '../types/goodsReceived';

interface GRNTableProps {
  grns: GoodsReceivedNote[];
  onView: (grn: GoodsReceivedNote) => void;
  onDownload?: (grn: GoodsReceivedNote) => void;
}

export const GRNTable: React.FC<GRNTableProps> = ({
  grns,
  onView,
  onDownload
}) => {
console.log("grns", grns)
  if (grns?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-gray-500">No goods received notes found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-500"></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <th className="text-left p-4 font-semibold text-gray-700">GRN #</th>
                <th className="text-left p-4 font-semibold text-gray-700">PO #</th>
                <th className="text-left p-4 font-semibold text-gray-700">Supplier</th>
                <th className="text-left p-4 font-semibold text-gray-700">Received Date</th>
                <th className="text-left p-4 font-semibold text-gray-700">Received By</th>
                <th className="text-left p-4 font-semibold text-gray-700">Items</th>
                <th className="text-left p-4 font-semibold text-gray-700">Delivery Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grns?.map((grn, index) => (
                <GRNRow
                  key={grn._id}
                  grn={grn}
                  index={index}
                  onView={onView}
                  onDownload={onDownload}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};