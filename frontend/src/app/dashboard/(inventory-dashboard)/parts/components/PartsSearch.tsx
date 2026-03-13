'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Input } from '@/components/form/Input';
import { Search } from 'lucide-react';

interface PartsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const PartsSearch: React.FC<PartsSearchProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Search by part name or number...'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4f46e5]" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 border-2 border-[#e5e7eb] hover:border-[#c7d2fe] focus:border-[#4f46e5] transition-colors"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};