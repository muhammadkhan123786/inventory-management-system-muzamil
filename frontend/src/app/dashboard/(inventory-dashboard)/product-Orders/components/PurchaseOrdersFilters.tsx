'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Input } from '@/components/form/Input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseOrdersFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  statuses: string[];
}

export const PurchaseOrdersFilters: React.FC<PurchaseOrdersFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  statuses
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#14b8a6]" />
              <Input
                placeholder="Search by order number or supplier..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  "pl-10 h-12 border-2 border-[#d1fae5]",
                  "hover:border-[#a7f3d0] focus:border-[#14b8a6] transition-colors"
                )}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className={cn(
                "h-12 px-4 rounded-md border-2 border-[#d1fae5]",
                "hover:border-[#a7f3d0] focus:border-[#14b8a6] focus:outline-none transition-colors"
              )}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};