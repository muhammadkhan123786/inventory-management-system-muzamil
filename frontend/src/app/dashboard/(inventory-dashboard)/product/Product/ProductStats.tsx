// components/product/ProductStats.tsx
import { Card, CardContent } from '@/components/form/Card';
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react';
import { ProductStats } from '../components/Interface';
import { 
  Package, 
  CheckCircle, 
  Box, 
  AlertCircle, 
  Star 
} from 'lucide-react';
interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: LucideIcon;
  index: number;
}

const StatCard = ({ label, value, color, icon: Icon, index }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.05, y: -4 }}
  >
    <Card className={`bg-gradient-to-br ${color} border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 text-xs font-medium">{label}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-white/80" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

interface ProductStatsProps {
  stats: ProductStats;
}

const STAT_CONFIGS = [
  { label: 'Total Products', color: 'from-indigo-500 to-purple-500', icon: Package },
  { label: 'Active', color: 'from-blue-500 to-cyan-500', icon: CheckCircle },
  { label: 'In Stock', color: 'from-emerald-500 to-green-500', icon: Box },
  { label: 'Low Stock', color: 'from-amber-500 to-orange-500', icon: AlertCircle },
  { label: 'Out of Stock', color: 'from-rose-500 to-red-600', icon: AlertCircle },
  { label: 'Featured', color: 'from-yellow-500 to-amber-500', icon: Star }
] as const;



export const ProductStatistics = ({ stats }: ProductStatsProps) => {
  const statValues = [
    stats.total,
    stats.activeCount,
    stats.inactiveCount,
    stats.inStockCount,
    stats.lowStockCount,
    stats.featuredCount
  ];
console.log("stats", stats)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {STAT_CONFIGS.map((config, index) => {
        return (
          <StatCard
            key={config.label}
            label={config.label}
            value={statValues[index]}
            color={config.color}
            icon={config.icon}
            index={index}
          />
        );
      })}
    </div>
  );
};