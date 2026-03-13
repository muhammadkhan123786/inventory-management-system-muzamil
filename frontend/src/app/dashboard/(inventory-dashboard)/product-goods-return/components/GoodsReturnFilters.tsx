'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Input } from '@/components/form/Input';
import { Button } from '@/components/form/CustomButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/form/Select';
import { Search, Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoodsReturnFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  statuses: string[];
}

export const GoodsReturnFilters: React.FC<GoodsReturnFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  statuses
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500"></div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#f97316]" />
              <Input
                placeholder="Search by return number, GRN, or supplier..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  "pl-10 h-12 border-2 border-[#fed7aa]",
                  "hover:border-[#fdba74] focus:border-[#f97316] transition-colors"
                )}
              />
            </div>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className={cn(
                "h-12 w-full md:w-48 border-2 border-[#fed7aa]",
                "hover:border-[#fdba74] focus:border-[#f97316]"
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onViewModeChange('grid')}
                className="h-12 w-12"
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onViewModeChange('table')}
                className="h-12 w-12"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};