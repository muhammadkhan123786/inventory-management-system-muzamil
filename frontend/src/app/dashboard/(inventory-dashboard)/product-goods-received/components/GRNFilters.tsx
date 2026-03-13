'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Input } from '@/components/form/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/form/Select';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusOption {
  value: string;
  label: string;
}

interface GRNFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  statuses: StatusOption[];
}

export const GRNFilters: React.FC<GRNFiltersProps> = ({
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
        <div className="h-1 bg-gradient-to-r from-blue-500 to-teal-500" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#06b6d4]" />
              <Input
                placeholder="Search by GRN number, PO number, or supplier..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  'pl-10 h-12 border-2 border-[#cffafe]',
                  'hover:border-[#a5f3fc] focus:border-[#06b6d4] transition-colors'
                )}
              />
            </div>

            {/* Status Select */}
            <Select
              value={selectedStatus}
              onValueChange={(value) => onStatusChange(value)}
            >
              <SelectTrigger className="h-12 w-[200px] border-2 border-[#cffafe]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>

              <SelectContent>
                {statuses?.map((statusOption) => (
                  <SelectItem 
                    key={statusOption.value} 
                    value={statusOption.value}
                  >
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};