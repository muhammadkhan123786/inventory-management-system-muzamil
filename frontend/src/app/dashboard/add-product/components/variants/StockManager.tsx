// components/variants/StockManager.tsx
"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Warehouse,
  MapPin,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Grid,
  Filter,
  Search,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { Input } from '@/components/form/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";

interface StockManagerProps {
  variants: Array<{
    id: string;
    sku: string;
    attributes: Record<string, any>;
    stock: Array<{
      warehouseId: string;
      quantity: number;
      statusId?: string;
      conditionId?: string;
      location?: string;
      reorderPoint?: number;
    }>;
    isActive: boolean;
  }>;
  warehouses: Array<{ value: string; label: string }>;
  productStatus: Array<{ value: string; label: string }>;
  conditions: Array<{ value: string; label: string }>;
  warehouseStatus: Array<{ value: string; label: string }>;
  bulkEditMode?: boolean;
  selectedVariants?: string[];
  onUpdateStock?: (variantId: string, warehouseId: string, updates: any) => void;
  onBulkUpdate?: (updates: any) => void;
}

export function StockManager({
  variants,
  warehouses,
  productStatus,
  conditions,
  warehouseStatus,
  bulkEditMode = false,
  selectedVariants = [],
  onUpdateStock = () => {},
  onBulkUpdate = () => {}
}: StockManagerProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [stockAdjustment, setStockAdjustment] = useState({
    operation: 'set', // 'set', 'increase', 'decrease'
    value: '',
    applyTo: 'all' // 'all', 'low', 'out', 'selected'
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);

  // Filtered warehouses
  const filteredWarehouses = useMemo(() => {
    if (selectedWarehouse === 'all') return warehouses;
    return warehouses.filter(w => w.value === selectedWarehouse);
  }, [warehouses, selectedWarehouse]);

  // Get stock for a variant in a specific warehouse
  const getStock = (variant: any, warehouseId: string) => {
    const stock = variant.stock.find((s: any) => s.warehouseId === warehouseId);
    return stock?.quantity || 0;
  };

  // Get total stock across all warehouses for a variant
  const getTotalStock = (variant: any) => {
    return variant.stock.reduce((sum: number, s: any) => sum + s.quantity, 0);
  };

  // Filter variants based on search and stock level
  const filteredVariants = useMemo(() => {
    let filtered = [...variants];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(variant => 
        variant.sku.toLowerCase().includes(query) ||
        Object.values(variant.attributes).some(val => 
          String(val).toLowerCase().includes(query)
        )
      );
    }

    // Apply stock level filter
    if (stockAdjustment.applyTo !== 'all') {
      filtered = filtered.filter(variant => {
        const totalStock = getTotalStock(variant);
        
        switch (stockAdjustment.applyTo) {
          case 'low':
            return totalStock > 0 && totalStock <= lowStockThreshold;
          case 'out':
            return totalStock === 0;
          case 'selected':
            return selectedVariants.includes(variant.id);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [variants, searchQuery, stockAdjustment.applyTo, selectedVariants, lowStockThreshold]);

  // Calculate warehouse statistics
  const warehouseStats = useMemo(() => {
    const stats: Record<string, {
      total: number;
      variants: number;
      lowStock: number;
      outOfStock: number;
      average: number;
    }> = {};

    warehouses.forEach(warehouse => {
      const warehouseVariants = variants.filter(v => 
        v.stock.some(s => s.warehouseId === warehouse.value)
      );
      
      const quantities = warehouseVariants.map(v => 
        getStock(v, warehouse.value)
      );
      
      const total = quantities.reduce((sum, q) => sum + q, 0);
      const lowStock = quantities.filter(q => q > 0 && q <= lowStockThreshold).length;
      const outOfStock = quantities.filter(q => q === 0).length;
      const average = warehouseVariants.length > 0 ? total / warehouseVariants.length : 0;

      stats[warehouse.value] = {
        total,
        variants: warehouseVariants.length,
        lowStock,
        outOfStock,
        average
      };
    });

    return stats;
  }, [variants, warehouses, lowStockThreshold]);

  // Handle stock adjustment
  const handleStockAdjustment = () => {
    if (!stockAdjustment.value && stockAdjustment.operation === 'set') {
      alert("Please enter a quantity value");
      return;
    }

    const value = parseInt(stockAdjustment.value || '0');
    if (isNaN(value)) {
      alert("Please enter a valid number");
      return;
    }

    const updates: any = {};

    switch (stockAdjustment.operation) {
      case 'set':
        updates.quantity = value;
        break;
      case 'increase':
        updates.quantity = (prev: number) => prev + value;
        break;
      case 'decrease':
        updates.quantity = (prev: number) => Math.max(0, prev - value);
        break;
    }

    onBulkUpdate(updates);
    
    // Reset adjustment
    setStockAdjustment({
      operation: 'set',
      value: '',
      applyTo: 'all'
    });
  };

  // Handle individual stock update
  const handleStockUpdate = (variantId: string, warehouseId: string, newQuantity: number) => {
    onUpdateStock(variantId, warehouseId, { quantity: newQuantity });
  };

  // Get stock status color
  const getStockStatusColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600 bg-red-50';
    if (quantity <= lowStockThreshold) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  // Get stock status text
  const getStockStatusText = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  // Export stock report
  const handleExport = () => {
    const csvData = [
      ['SKU', ...warehouses.map(w => w.label), 'Total Stock', 'Status'].join(','),
      ...filteredVariants.map(v => [
        v.sku,
        ...warehouses.map(w => getStock(v, w.value)),
        getTotalStock(v),
        getStockStatusText(getTotalStock(v))
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Quick stock actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'set_zero':
        onBulkUpdate({ quantity: 0 });
        break;
      case 'set_hundred':
        onBulkUpdate({ quantity: 100 });
        break;
      case 'increase_ten':
        onBulkUpdate({ quantity: (prev: number) => prev + 10 });
        break;
      case 'decrease_ten':
        onBulkUpdate({ quantity: (prev: number) => Math.max(0, prev - 10) });
        break;
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Stock Manager</h3>
              <p className="text-sm text-gray-600">
                Manage inventory across {warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Warehouse Filter */}
            <Select
              value={selectedWarehouse}
              onValueChange={setSelectedWarehouse}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.value} value={warehouse.value}>
                    {warehouse.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stock Adjustment Toolbar */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Bulk Stock Adjustment
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Adjust stock for {filteredVariants.length} variant{filteredVariants.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Operation */}
              <Select
                value={stockAdjustment.operation}
                onValueChange={(value: any) => setStockAdjustment(prev => ({ ...prev, operation: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set to</SelectItem>
                  <SelectItem value="increase">Increase by</SelectItem>
                  <SelectItem value="decrease">Decrease by</SelectItem>
                </SelectContent>
              </Select>

              {/* Quantity */}
              <Input
                type="number"
                value={stockAdjustment.value}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0"
                className="w-32"
                min="0"
                step="1"
              />

              {/* Apply To */}
              <Select
                value={stockAdjustment.applyTo}
                onValueChange={(value: any) => setStockAdjustment(prev => ({ ...prev, applyTo: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Apply to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Variants</SelectItem>
                  <SelectItem value="low">Low Stock Only</SelectItem>
                  <SelectItem value="out">Out of Stock Only</SelectItem>
                  {bulkEditMode && (
                    <SelectItem value="selected">Selected Variants</SelectItem>
                  )}
                </SelectContent>
              </Select>

              <button
                onClick={handleStockAdjustment}
                disabled={!stockAdjustment.value && stockAdjustment.operation === 'set'}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickAction('set_zero')}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
            >
              <Minus className="h-3 w-3" />
              Set to 0
            </button>
            <button
              onClick={() => handleQuickAction('set_hundred')}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center gap-2"
            >
              <Plus className="h-3 w-3" />
              Set to 100
            </button>
            <button
              onClick={() => handleQuickAction('increase_ten')}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-2"
            >
              <TrendingUp className="h-3 w-3" />
              +10 Units
            </button>
            <button
              onClick={() => handleQuickAction('decrease_ten')}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm flex items-center gap-2"
            >
              <TrendingDown className="h-3 w-3" />
              -10 Units
            </button>
          </div>
        </div>

        {/* Warehouse Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredWarehouses.map(warehouse => {
            const stat = warehouseStats[warehouse.value];
            if (!stat) return null;

            return (
              <div key={warehouse.value} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-800">{warehouse.label}</h5>
                  <Badge className="bg-blue-100 text-blue-800">
                    {stat.variants} variants
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-600">Total Stock</div>
                    <div className="font-bold text-gray-800">{stat.total}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Average</div>
                    <div className="font-bold text-blue-600">{stat.average.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Low Stock</div>
                    <div className="font-bold text-amber-600">{stat.lowStock}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Out of Stock</div>
                    <div className="font-bold text-red-600">{stat.outOfStock}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">
                    {((stat.lowStock + stat.outOfStock) / stat.variants * 100).toFixed(1)}% needs attention
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search variants by SKU or attribute..."
                className="pl-10 w-full"
              />
            </div>

            {/* Low Stock Threshold */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Low Stock Threshold:</span>
              <Input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                className="w-20"
                min="1"
                step="1"
              />
            </div>

            {/* Clear Filters */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Stock Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Variant / SKU
                </th>
                {filteredWarehouses.map(warehouse => (
                  <th key={warehouse.value} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-blue-600" />
                      {warehouse.label}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Total Stock
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((variant, index) => {
                const totalStock = getTotalStock(variant);
                const stockStatus = getStockStatusText(totalStock);
                const stockStatusColor = getStockStatusColor(totalStock);

                return (
                  <tr 
                    key={variant.id} 
                    className={`border-b hover:bg-gray-50 ${
                      bulkEditMode && selectedVariants.includes(variant.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Variant Info */}
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-mono font-bold text-gray-800">{variant.sku}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {Object.entries(variant.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </div>
                      </div>
                    </td>

                    {/* Warehouse Stocks */}
                    {filteredWarehouses.map(warehouse => {
                      const stock = getStock(variant, warehouse.value);
                      const cellStatusColor = getStockStatusColor(stock);

                      return (
                        <td key={`${variant.id}-${warehouse.value}`} className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={stock}
                              onChange={(e) => {
                                const newValue = parseInt(e.target.value) || 0;
                                handleStockUpdate(variant.id, warehouse.value, newValue);
                              }}
                              className={`w-20 px-2 py-1 rounded border text-center font-medium ${cellStatusColor}`}
                              min="0"
                              step="1"
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleStockUpdate(variant.id, warehouse.value, stock + 1)}
                                className="h-5 w-5 flex items-center justify-center bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleStockUpdate(variant.id, warehouse.value, Math.max(0, stock - 1))}
                                className="h-5 w-5 flex items-center justify-center bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Stock */}
                    <td className="px-4 py-3">
                      <div className={`px-3 py-1.5 rounded-lg text-center font-bold ${stockStatusColor}`}>
                        {totalStock}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge className={stockStatusColor.replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}>
                        {stockStatus}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            filteredWarehouses.forEach(warehouse => {
                              handleStockUpdate(variant.id, warehouse.value, 0);
                            });
                          }}
                          className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                          title="Clear all stock"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => {
                            const average = Math.floor(totalStock / filteredWarehouses.length);
                            filteredWarehouses.forEach(warehouse => {
                              handleStockUpdate(variant.id, warehouse.value, average);
                            });
                          }}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                          title="Distribute evenly"
                        >
                          Distribute
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredVariants.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="inline-block mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">No stock data found</h4>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms' : 'Add stock information to your variants'}
            </p>
          </div>
        )}

        {/* Alerts Summary */}
        {filteredVariants.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <h5 className="font-semibold text-gray-800">Stock Alerts</h5>
                  <p className="text-sm text-gray-600">
                    {filteredVariants.filter(v => getTotalStock(v) === 0).length} out of stock • 
                    {filteredVariants.filter(v => {
                      const total = getTotalStock(v);
                      return total > 0 && total <= lowStockThreshold;
                    }).length} low stock
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const lowStockVariants = filteredVariants.filter(v => {
                    const total = getTotalStock(v);
                    return total > 0 && total <= lowStockThreshold;
                  });
                  
                  const outOfStockVariants = filteredVariants.filter(v => getTotalStock(v) === 0);
                  
                  // Apply reorder to low stock variants
                  lowStockVariants.forEach(variant => {
                    filteredWarehouses.forEach(warehouse => {
                      const currentStock = getStock(variant, warehouse.value);
                      if (currentStock <= lowStockThreshold) {
                        handleStockUpdate(variant.id, warehouse.value, currentStock + 50);
                      }
                    });
                  });
                  
                  alert(`Restocked ${lowStockVariants.length} low stock variants`);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reorder Low Stock
              </button>
            </div>
          </div>
        )}

        {/* Footer Summary */}
        {filteredVariants.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {filteredVariants.length} variant{filteredVariants.length !== 1 ? 's' : ''} across {filteredWarehouses.length} warehouse{filteredWarehouses.length !== 1 ? 's' : ''}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Total Inventory: </span>
                  <span className="font-bold text-blue-600">
                    {filteredVariants.reduce((sum, v) => sum + getTotalStock(v), 0)} units
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    // Save all stock changes
                    console.log('Save all stock changes');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Save All Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}