'use client';

import { motion } from 'framer-motion';

interface PartsHeaderProps {
  title?: string;
  subtitle?: string;
}

export const PartsHeader: React.FC<PartsHeaderProps> = ({
  title = 'Parts & Inventory',
  subtitle = 'Manage spare parts and inventory'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-semibold bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-gray-600 mt-1">{subtitle}</p>
    </motion.div>
  );
};