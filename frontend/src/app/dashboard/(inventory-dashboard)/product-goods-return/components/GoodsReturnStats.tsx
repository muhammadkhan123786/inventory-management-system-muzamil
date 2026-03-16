'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { ReturnStats } from '../types/goodsReturn';
import { PackageX, AlertTriangle, Truck, CheckCircle2, TrendingDown, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrencyStore } from "@/stores/currency.store";

interface GoodsReturnStatsProps {
  stats: ReturnStats;
}

// Map your API response to the format expected by statCards
const mapStatsToDisplay = (stats: any) => ({
  totalReturns: stats.totalReturns || 0,
  pendingReturns: stats.pending || 0,
  inTransitReturns: stats.rejected || 0, // Using rejected for inTransit if that's what you want
  completedReturns: stats.completed || 0,
  totalReturnValue: stats.totalValue || 0
});


export const GoodsReturnStats: React.FC<GoodsReturnStatsProps> = ({ stats }) => {
const currencySymbol = useCurrencyStore((s) => s.currencySymbol);
 
  const statCards = [
  {
    key: 'totalReturns' as const,
    label: 'Total Returns',
    gradient: 'from-orange-500 to-amber-500',
    icon: PackageX,
    badgeText: 'Total'
  },
  {
    key: 'pendingReturns' as const,
    label: 'Pending Approval',
    gradient: 'from-yellow-500 to-amber-500',
    icon: AlertTriangle,
    badgeText: 'Pending'
  },
  {
    key: 'inTransitReturns' as const,
    label: 'Rejected',
    gradient: 'from-red-500 to-rose-500',
    icon: XCircle, 
    badgeText: 'Rejected'
  },
  {
    key: 'completedReturns' as const,
    label: 'Completed',
    gradient: 'from-green-500 to-emerald-500',
    icon: CheckCircle2,
    badgeText: 'Done'
  },
  {
    key: 'totalReturnValue' as const,
    label: 'Return Value',
    gradient: 'from-purple-500 to-pink-500',
    icon: TrendingDown,
    badgeText: 'Value',
    format: (value: number) => `${currencySymbol}${value.toFixed(2)}`
  }
];

  // Map the stats to the expected format
  const displayStats = mapStatsToDisplay(stats);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const value = displayStats[stat.key];
        const displayValue = stat.format ? stat.format(value) : value;
        
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
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{displayValue}</p>
                <p className="text-white/90 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
};