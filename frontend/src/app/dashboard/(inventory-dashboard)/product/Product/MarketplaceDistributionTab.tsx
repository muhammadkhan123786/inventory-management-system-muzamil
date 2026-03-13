// components/MarketplaceDistributionTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { Button } from '@/components/form/CustomButton';
import { 
  Globe, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  ExternalLink,
  BarChart3,
  Package,
  DollarSign,
  Users
} from 'lucide-react';
import { Product } from '../types/product';

interface MarketplaceDistributionTabProps {
  products: Product[];
}

export const MarketplaceDistributionTab = ({ products }: MarketplaceDistributionTabProps) => {
  // Mock marketplace data
  const marketplaceData = [
    {
      id: 'amazon',
      name: 'Amazon',
      status: 'active',
      productsListed: 45,
      productsSynced: 42,
      productsPending: 3,
      revenue: 12450,
      orders: 156,
      syncStatus: 'synced',
      lastSynced: '2 hours ago'
    },
    {
      id: 'ebay',
      name: 'eBay',
      status: 'active',
      productsListed: 38,
      productsSynced: 38,
      productsPending: 0,
      revenue: 8450,
      orders: 89,
      syncStatus: 'synced',
      lastSynced: '1 hour ago'
    },
    {
      id: 'walmart',
      name: 'Walmart Marketplace',
      status: 'active',
      productsListed: 32,
      productsSynced: 30,
      productsPending: 2,
      revenue: 5670,
      orders: 67,
      syncStatus: 'synced',
      lastSynced: '3 hours ago'
    },
    {
      id: 'shopify',
      name: 'Shopify Store',
      status: 'active',
      productsListed: 52,
      productsSynced: 52,
      productsPending: 0,
      revenue: 18900,
      orders: 210,
      syncStatus: 'synced',
      lastSynced: '30 minutes ago'
    },
    {
      id: 'etsy',
      name: 'Etsy',
      status: 'inactive',
      productsListed: 0,
      productsSynced: 0,
      productsPending: 0,
      revenue: 0,
      orders: 0,
      syncStatus: 'error',
      lastSynced: '1 week ago'
    }
  ];

  const totalStats = {
    marketplaces: marketplaceData.length,
    activeMarketplaces: marketplaceData.filter(m => m.status === 'active').length,
    totalRevenue: marketplaceData.reduce((sum, m) => sum + m.revenue, 0),
    totalOrders: marketplaceData.reduce((sum, m) => sum + m.orders, 0),
    totalProducts: products.length,
    syncedProducts: marketplaceData.reduce((sum, m) => sum + m.productsSynced, 0)
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { 
            label: 'Total Marketplaces', 
            value: totalStats.marketplaces, 
            color: 'from-indigo-500 to-purple-500', 
            icon: Globe 
          },
          { 
            label: 'Active', 
            value: totalStats.activeMarketplaces, 
            color: 'from-emerald-500 to-green-500', 
            icon: CheckCircle 
          },
          { 
            label: 'Total Revenue', 
            value: `£${totalStats.totalRevenue.toLocaleString()}`, 
            color: 'from-blue-500 to-cyan-500', 
            icon: DollarSign 
          },
          { 
            label: 'Total Orders', 
            value: totalStats.totalOrders, 
            color: 'from-orange-500 to-amber-500', 
            icon: ShoppingCart 
          },
          { 
            label: 'Products Listed', 
            value: totalStats.totalProducts, 
            color: 'from-purple-500 to-pink-500', 
            icon: Package 
          },
          { 
            label: 'Synced Products', 
            value: totalStats.syncedProducts, 
            color: 'from-teal-500 to-emerald-500', 
            icon: RefreshCw 
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} border-0 shadow-lg`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/90 text-xs font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-white/80" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Marketplaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceData.map((marketplace) => (
          <Card key={marketplace.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  {marketplace.name}
                </CardTitle>
                <Badge className={
                  marketplace.status === 'active' 
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }>
                  {marketplace.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{marketplace.productsListed}</p>
                  <p className="text-xs text-gray-600">Products</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{marketplace.orders}</p>
                  <p className="text-xs text-gray-600">Orders</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">£{marketplace.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1">
                    {marketplace.syncStatus === 'synced' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : marketplace.syncStatus === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    <p className="text-sm font-medium">
                      {marketplace.syncStatus === 'synced' ? 'Synced' : 'Error'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{marketplace.lastSynced}</p>
                </div>
              </div>

              {/* Sync Status */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Synced Products:</span>
                  <span className="font-semibold text-emerald-700">{marketplace.productsSynced}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Pending Sync:</span>
                  <span className="font-semibold text-amber-700">{marketplace.productsPending}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" variant="outline">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync Now
                </Button>
                <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Multi-Channel Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-slate-100 rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Sales analytics chart would be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">Revenue distribution across marketplaces</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};