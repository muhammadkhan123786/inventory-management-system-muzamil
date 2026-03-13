import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { motion } from 'framer-motion';
import { MarketplaceData } from '../data/marketplaceData';

interface MarketplaceCardProps {
  marketplace: MarketplaceData;
  index: number;
}

export function MarketplaceCard({ marketplace, index }: MarketplaceCardProps) {
  const Icon = marketplace.icon;
  const sellThrough = ((marketplace.sold / marketplace.allocated) * 100).toFixed(1);
  const available = marketplace.allocated - marketplace.sold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${marketplace.color}20` }}
            >
              <Icon className="h-6 w-6" style={{ color: marketplace.color }} />
            </div>
            <Badge 
              className="text-white"
              style={{ backgroundColor: marketplace.color }}
            >
              {sellThrough}% Sold
            </Badge>
          </div>
          
          <h3 className="font-semibold text-lg mb-3">{marketplace.name}</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Allocated:</span>
              <span className="font-semibold">{marketplace.allocated} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sold:</span>
              <span className="font-semibold text-green-600">{marketplace.sold} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available:</span>
              <span className="font-semibold text-blue-600">{available} units</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-bold" style={{ color: marketplace.color }}>
                £{marketplace.revenue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ 
                  width: `${sellThrough}%`,
                  backgroundColor: marketplace.color
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}