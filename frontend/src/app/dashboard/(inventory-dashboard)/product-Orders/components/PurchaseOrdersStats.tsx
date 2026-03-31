'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { PurchaseOrderStats } from '../types/purchaseOrders';
import { Receipt, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IPurchaseOrder } from '../types/purchaseOrders';

interface PurchaseOrdersStatsProps {
 stats: PurchaseOrderStats; 
}

const statCards = [
  {
    key: 'totalOrders' as const,
    label: 'Total Orders',
    gradient: 'from-emerald-500 to-teal-500',
    icon: Receipt,
    badgeText: 'Total'
  },
  {
    key: 'pendingOrders' as const,
     label: 'Cancelled Orders',
    gradient: 'from-red-500 to-rose-500',
     icon: XCircle,
    badgeText: 'Cancelled'
  },
  {
    key: 'orderedCount' as const,
     label: 'Draft Orders',
     gradient: 'from-indigo-500 to-purple-500',
    icon: FileText,
    badgeText: 'Draft'
  },
  {
    key: 'receivedCount' as const,
    label: 'Received',
    gradient: 'from-green-500 to-emerald-500',
    icon: CheckCircle2,
    badgeText: 'Complete'
  }
];

export const PurchaseOrdersStats: React.FC<PurchaseOrdersStatsProps> = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const value = stats[stat.key];
        
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className={cn(
              "border-0 shadow-lg text-white overflow-hidden",
              `bg-gradient-to-br ${stat.gradient}`
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {stat.badgeText}
                  </Badge>
                </div>
                <p className="text-5xl font-bold mb-2">{value}</p>
                <p className="text-white/90 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};