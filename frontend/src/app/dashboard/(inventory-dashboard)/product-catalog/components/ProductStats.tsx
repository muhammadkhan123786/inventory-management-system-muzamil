import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { ProductStats } from '../types/products';
import { Package, CheckCircle, AlertCircle, Box, PoundSterling } from 'lucide-react';

interface ProductStatsProps {
  stats: ProductStats;
}

const statItems = [
  {
    key: 'totalProducts',
    label: 'Total Products',
    icon: Package,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    key: 'activeProducts',
    label: 'Active',
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-600'
  },
  {
    key: 'lowStock',
    label: 'Low Stock',
    icon: AlertCircle,
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    key: 'outOfStock',
    label: 'Out of Stock',
    icon: Box,
    gradient: 'from-red-500 to-red-600'
  },
  {
    key: 'totalValue',
    label: 'Total Value',
    icon: PoundSterling,
    gradient: 'from-purple-500 to-purple-600'
  }
];

export const ProductStat: React.FC<ProductStatsProps> = ({ stats }) => {
 console.log("stats", stats)
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof ProductStats];
        const displayValue = item.key === 'totalValue' 
          ? `£${value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : value;

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <Card className={`border-0 shadow-xl bg-gradient-to-br ${item.gradient}`}>
              <CardContent className="p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-opacity-90 text-sm font-medium">{item.label}</p>
                    <h3 className="text-3xl font-bold mt-1">{displayValue}</h3>
                  </div>
                  <Icon className="h-12 w-12 text-opacity-80" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};