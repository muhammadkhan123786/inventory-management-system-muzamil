import { Card, CardContent, CardHeader, CardTitle } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { PRODUCTS } from '../data/marketplaceData';
import { MARKETPLACES } from '../data/marketplaceData';

export function ProductDistributionTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Product Distribution Across Marketplaces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
                  {MARKETPLACES.map(mp => (
                    <th key={mp.name} className="text-center py-3 px-4 font-semibold text-gray-700">
                      {mp.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {product.sku}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-lg">{product.totalStock}</span>
                    </td>
                    {MARKETPLACES.map(mp => {
                      const marketplaceKey = mp.name.toLowerCase().replace(' ', '');
                      return (
                        <td key={`${product.id}-${mp.name}`} className="py-3 px-4 text-center">
                          <Badge style={{ 
                            backgroundColor: `${mp.color}20`, 
                            color: mp.color 
                          }}>
                            {product.marketplaces[marketplaceKey]}
                          </Badge>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}