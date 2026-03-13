'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { GRNStats } from '../types/goodsReceived';
import { FileText, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GRNStatsProps {
  stats: GRNStats;
}
const statCards = [
  {
    key: 'totalGRNs' as const,
    label: 'Total GRNs',
    gradient: 'from-blue-500 to-cyan-500',
    icon: FileText,
    badgeText: 'Total'
  },
  {
    key: 'completedGRNs' as const,
    label: 'Completed',
    gradient: 'from-green-500 to-emerald-500',
    icon: CheckCircle2,
    badgeText: 'Complete'
  },
  {
    key: 'discrepancyGRNs' as const,
    label: 'With Discrepancies',
    gradient: 'from-orange-500 to-amber-500',
    icon: AlertTriangle,
    badgeText: 'Issues'
  },
  {
    key: 'totalItemsReceived' as const,
    label: 'Items Received',
    gradient: 'from-purple-500 to-fuchsia-500',
    icon: TrendingUp,
    badgeText: 'Items'
  }
];

export const GRNStat: React.FC<GRNStatsProps> = ({ stats }) => {

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