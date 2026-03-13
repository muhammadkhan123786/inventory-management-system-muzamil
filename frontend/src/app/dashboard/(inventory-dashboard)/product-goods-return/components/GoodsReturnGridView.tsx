'use client';

import { motion } from 'framer-motion';
import { GoodsReturnCard } from './GoodsReturnCard';
import { Card, CardContent } from '@/components/form/Card';
import { PackageX } from 'lucide-react';
import { GoodsReturnNote } from '../types/goodsReturn';

interface GoodsReturnGridViewProps {
  returns: GoodsReturnNote[];
  onView: (grtn: GoodsReturnNote) => void;
  onDownload?: (grtn: GoodsReturnNote) => void;
}

export const GoodsReturnGridView: React.FC<GoodsReturnGridViewProps> = ({
  returns,
  onView,
  onDownload
}) => {
  if (returns?.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <PackageX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Return Notes Found</h3>
          <p className="text-gray-500">No goods return notes match your search criteria</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 gap-6"
    >
      {returns?.map((grtn, index) => (
        <GoodsReturnCard
          key={grtn._id}
          grtn={grtn}
          index={index}
          onView={onView}
          onDownload={onDownload}
        />
      ))}
    </motion.div>
  );
};