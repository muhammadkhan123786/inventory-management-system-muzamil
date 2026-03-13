'use client';

import { motion } from 'framer-motion';
import { PartCard } from './PartCard';
import { Part } from '../types/parts';
import { Package } from 'lucide-react';

interface PartsGridProps {
  parts: Part[];
  onOrderMore: (partId: string) => void;
}

export const PartsGrid: React.FC<PartsGridProps> = ({ parts, onOrderMore }) => {
  if (parts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No parts found matching your search.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {parts.map((part, index) => (
        <PartCard
          key={part.id}
          part={part}
          index={index}
          onOrderMore={onOrderMore}
        />
      ))}
    </motion.div>
  );
};