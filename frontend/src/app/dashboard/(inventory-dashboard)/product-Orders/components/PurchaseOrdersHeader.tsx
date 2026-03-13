'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Button } from '@/components/form/CustomButton';
import { Plus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurchaseOrdersHeaderProps {
  onCreateOrder: () => void;
  title?: string;
  subtitle?: string;
}

export const PurchaseOrdersHeader: React.FC<PurchaseOrdersHeaderProps> = ({
  onCreateOrder,
  title = 'Purchase Orders',
  subtitle = 'Manage inventory procurement'
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-xl opacity-20 -z-10"></div>
      <Card className="border-0 shadow-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-xl"
              >
                <ShoppingCart className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  {title}
                </h1>
                <p className="text-white/90 mt-1 text-lg">{subtitle}</p>
              </div>
            </div>
            <Button 
              onClick={onCreateOrder}
              className={cn(
                "gap-2 bg-white text-teal-600 hover:bg-white/90 shadow-2xl hover:shadow-white/50",
                "transition-all duration-300 px-6 py-6 text-lg font-semibold"
              )}
            >
              <Plus className="h-5 w-5" />
              Create Purchase Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};