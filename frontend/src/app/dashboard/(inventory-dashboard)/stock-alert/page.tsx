"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, AlertTriangle, Shield, TrendingDown,
  Search, ArrowLeft, RefreshCw,
  Clock, Package, Truck, CheckCircle, 
  X, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { StockAlertBell } from '../components/StockAlertBell';
import { ReplenishmentProposalsModal } from '../product-Orders/components/ReplenishmentProposalsModal';
import { useReorderSuggestions, ReorderProduct } from '@/hooks/useReorderSuggestions';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { BulkOrderGroup } from '@/helper/purchaseOrderApi';
import { toast } from 'sonner';

// Severity Configuration
const SEVERITY_CONFIG = {
  critical: {
    icon: Shield,
    label: 'Critical',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    badge: 'bg-red-500',
    lightBadge: 'bg-red-100',
    gradient: 'from-red-600 to-rose-600'
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    badge: 'bg-orange-500',
    lightBadge: 'bg-orange-100',
    gradient: 'from-orange-500 to-amber-500'
  },
  low: {
    icon: TrendingDown,
    label: 'Low Stock',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    badge: 'bg-amber-500',
    lightBadge: 'bg-amber-100',
    gradient: 'from-amber-500 to-yellow-500'
  }
};

export default function AlertsPage() {
  const [userId, setUserId] = useState(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || user._id || '';
    }
    return '';
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showProposals, setShowProposals] = useState(false);
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);

  // Get the bulk order handler from usePurchaseOrders
  const {
    handleCreateBulkOrders: onCreateBulkOrders,
  } = usePurchaseOrders();

  // Get reorder suggestions
  const {
    reorderProducts,
    isFetchingReorder,
    fetchReorderSuggestions,
    resetReorderState
  } = useReorderSuggestions({
    userId: userId || '',
    createAlerts: false,
    sendEmails: false,
    autoFetch: false
  });

  // Get stock alerts
  const {
    alerts,
    isLoading,
    count,
    criticalCount,
    warningCount,
    lowCount,
    fetchAlerts,
    dismissAlert,
    refetchCount
  } = useStockAlerts({ 
    userId: userId || '', 
    autoFetch: true,
    pollIntervalMs: 30000 
  });

  // Handle opening proposals modal
  const handleOpenProposals = async () => {
    if (!userId) {
      toast.error('User ID not found');
      return;
    }
    setShowProposals(true);
    await fetchReorderSuggestions(true);
  };

  // Handle creating bulk orders from selected products
  const handleCreateOrders = useCallback(async (selected: ReorderProduct[]) => {
    if (!onCreateBulkOrders) {
      toast.error("Bulk order handler not configured.");
      return;
    }

    setIsCreatingBulk(true);
    
    try {
      // Group selected products by supplier
      const map = new Map<string, ReorderProduct[]>();
      selected.forEach(p => {
        const key = p.supplierId || "no-supplier";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
      });

      const groups: BulkOrderGroup[] = Array.from(map.entries()).map(([supplierId, prods]) => ({
        poNumber: "",
        supplierId,
        supplierName: prods[0].supplierName,
        supplierEmail: prods[0].supplierEmail,
        products: prods.map(p => ({
          productId: p.productId,
          productName: p.productName,
          sku: p.sku,
          suggestedQty: p.suggestedQty,
          costPrice: p.costPrice,
          maxStockLevel: p.maxStockLevel
        })),
        expectedDelivery: "",
      }));

      console.log('📦 Creating bulk orders with groups:', groups);
      
      await onCreateBulkOrders(groups);

      toast.success(
        `${groups.length} purchase order${groups.length > 1 ? "s" : ""} created and emailed!`,
        { duration: 4000 }
      );

      // Close modal and reset
      setShowProposals(false);
      resetReorderState();
      
      // Refresh alerts and suggestions
      await fetchAlerts();
      await fetchReorderSuggestions(true);

    } catch (error: any) {
      console.error('❌ Failed to create orders:', error);
      toast.error(error.message || "Failed to create purchase orders.");
    } finally {
      setIsCreatingBulk(false);
    }
  }, [onCreateBulkOrders, fetchReorderSuggestions, fetchAlerts, resetReorderState]);

  // Filter alerts based on search and severity
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const stats = [
    { 
      value: criticalCount, 
  
      ...SEVERITY_CONFIG.critical
    },
    { 
      value: warningCount, 
      ...SEVERITY_CONFIG.warning
    },
    { 
      value: lowCount, 
      ...SEVERITY_CONFIG.low
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/inventory-dashboard" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Stock Alerts Center
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchCount();
                fetchAlerts();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            <StockAlertBell userId={userId} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bg} rounded-xl p-6 border ${stat.border} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => setSeverityFilter(severityFilter === stat.label.toLowerCase() ? 'all' : stat.label.toLowerCase())}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center border ${stat.border}`}>
                    <Icon className={`h-6 w-6 ${stat.text}`} />
                  </div>
                  {severityFilter === stat.label.toLowerCase() && (
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full">
                      Filtered
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.label === 'Critical' ? 'Below safety stock' : 
                   stat.label === 'Warning' ? 'At reorder point' : 'Running low'}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, SKU or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-12 px-4 rounded-xl border border-gray-200 bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="low">Low Stock</option>
            </select>

            <button
              onClick={handleOpenProposals}
              disabled={alerts.length === 0}
              className={`px-6 h-12 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                alerts.length > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Package className="h-5 w-5" />
              Create Purchase Orders
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(severityFilter !== 'all' || searchTerm) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between"
          >
            <span className="text-sm text-indigo-700">
              Showing {filteredAlerts.length} of {alerts.length} alerts
              {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSeverityFilter('all');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell className="h-6 w-6 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-500 mt-4">Loading alerts...</p>
          </div>
        )}

        {/* No Alerts State */}
        {!isLoading && alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 rounded-2xl border border-green-200 p-16 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">All Stock Levels Healthy</h3>
            <p className="text-gray-500 mb-6">No products require restocking at this time.</p>
            <button
              onClick={() => fetchAlerts()}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Refresh
            </button>
          </motion.div>
        )}

        {/* No Results State */}
        {!isLoading && alerts.length > 0 && filteredAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-2xl border border-gray-200 p-16 text-center"
          >
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No matching alerts</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}

        {/* Alerts Table */}
        {!isLoading && filteredAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="col-span-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Severity</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time Left</span>
              </div>
              <div className="col-span-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Qty</span>
              </div>
              <div className="col-span-1" />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredAlerts.map((alert, index) => {
                  const config = SEVERITY_CONFIG[alert.severity];
                  const Icon = config.icon;
                  const stockPercentage = Math.min(100, (alert.currentStock / alert.reorderPoint) * 100);
                  
                  return (
                    <motion.div
                      key={alert._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${config.bg}`}
                    >
                      {/* Product Info */}
                      <div className="col-span-4">
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          {alert.productName}
                          {alert.severity === 'critical' && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                              URGENT
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{alert.sku}</p>
                        {alert.supplierName && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            {alert.supplierName}
                          </p>
                        )}
                      </div>

                      {/* Severity */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.bg} ${config.text} border ${config.border}`}>
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>

                      {/* Stock Level */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-lg font-bold ${config.text}`}>{alert.currentStock}</span>
                          <span className="text-xs text-gray-400">/ {alert.reorderPoint}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-500' :
                              alert.severity === 'warning' ? 'bg-orange-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Days Left */}
                      <div className="col-span-2">
                        {alert.daysUntilStockout != null ? (
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${
                              alert.daysUntilStockout <= 2 ? 'text-red-500' :
                              alert.daysUntilStockout <= 7 ? 'text-orange-500' :
                              'text-gray-400'
                            }`} />
                            <span className={`font-semibold ${
                              alert.daysUntilStockout <= 2 ? 'text-red-600' :
                              alert.daysUntilStockout <= 7 ? 'text-orange-600' :
                              'text-gray-600'
                            }`}>
                              {alert.daysUntilStockout}d
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>

                      {/* Order Quantity */}
                      <div className="col-span-1">
                        <span className="text-lg font-bold text-indigo-600">{alert.suggestedOrderQty}</span>
                      </div>

                      {/* Dismiss Button */}
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => dismissAlert(alert._id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>

      {/* Replenishment Modal */}
      <ReplenishmentProposalsModal
        open={showProposals}
        onOpenChange={setShowProposals}
        products={reorderProducts}
        onCreateOrders={handleCreateOrders}
        isCreating={isCreatingBulk || isFetchingReorder}
      />
    </div>
  );
}