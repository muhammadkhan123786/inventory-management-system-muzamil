'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/form/Card';
import { Button } from '@/components/form/CustomButton';
import { Badge } from '@/components/form/Badge';
import { Part } from '../types/parts';
import { Package, AlertCircle, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartCardProps {
  part: Part;
  index: number;
  onOrderMore: (partId: string) => void;
}

export const PartCard: React.FC<PartCardProps> = ({ part, index, onOrderMore }) => {
  const isLowStock = part.quantity > 0 && part.quantity <= 3;
  const isOutOfStock = part.quantity === 0;
  const isNormalStock = part.quantity > 3;

  const getStockGradient = () => {
    if (isOutOfStock) return 'from-gray-400 to-gray-500';
    if (isLowStock) return 'from-amber-500 to-orange-500';
    return 'from-emerald-500 to-green-500';
  };

  const getStockStatus = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return 'Low Stock';
    return 'In Stock';
  };

  const getStockBadgeVariant = () => {
    if (isOutOfStock) return 'destructive';
    if (isLowStock) return 'secondary';
    return 'default';
  };

  return (
    <motion.div
      key={part.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card className={cn(
        "border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden",
        isOutOfStock && "opacity-75"
      )}>
        <div className={`h-1 bg-gradient-to-r ${getStockGradient()}`}></div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{part.name}</CardTitle>
              <p className="text-sm text-gray-500 font-mono mt-1 bg-[#f3f4f6] px-2 py-1 rounded inline-block">
                {part.partNumber}
              </p>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${getStockGradient()} shadow-lg`}>
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Stock Quantity */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#f5f3ff] to-[#ede9fe] rounded-lg">
            <span className="text-sm text-gray-700 font-medium">Stock:</span>
            <Badge variant={getStockBadgeVariant()}>
              {part.quantity} units
            </Badge>
          </div>

          {/* Unit Price */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] rounded-lg">
            <span className="text-sm text-gray-700 font-medium">Unit Price:</span>
            <span className="font-semibold text-[#4f46e5]">${part.unitPrice.toFixed(2)}</span>
          </div>

          {/* Availability Status */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#faf5ff] to-[#f3e8ff] rounded-lg">
            <span className="text-sm text-gray-700 font-medium">Status:</span>
            <Badge variant={part.available ? 'default' : 'secondary'}>
              {part.available ? 'Available' : 'On Order'}
            </Badge>
          </div>

          {/* Category */}
          {part.category && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] rounded-lg">
              <span className="text-sm text-gray-700 font-medium">Category:</span>
              <span className="text-sm font-medium text-gray-900">{part.category}</span>
            </div>
          )}

          {/* Stock Alerts */}
          {isLowStock && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-2 bg-gradient-to-r from-[#fffbeb] to-[#fed7aa] rounded-lg text-amber-700 text-sm border border-amber-200"
            >
              <AlertCircle className="h-4 w-4 animate-pulse" />
              <span className="font-medium">Low stock alert</span>
            </motion.div>
          )}

          {isOutOfStock && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-2 bg-gradient-to-r from-[#fef2f2] to-[#fecaca] rounded-lg text-[#ef4444] text-sm border border-[#fca5a5]"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Out of stock</span>
            </motion.div>
          )}

          {/* Order Button */}
          <Button 
            variant="outline"
            onClick={() => onOrderMore(part.id)}
            className="w-full group hover:bg-gradient-to-r hover:from-[#4f46e5] hover:to-[#7c3aed] hover:text-white hover:border-transparent transition-all duration-300" 
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-bounce" />
            Order More
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};