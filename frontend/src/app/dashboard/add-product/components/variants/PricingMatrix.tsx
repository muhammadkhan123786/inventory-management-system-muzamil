// components/variants/PricingMatrix.tsx
"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Percent,
  Copy,
  Globe,
  Shield,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Grid
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

interface PricingMatrixProps {
  variants: Array<{
    id: string;
    sku: string;
    attributes: Record<string, any>;
    pricing: Array<{
      marketplaceId: string;
      price: number;
      currency?: string;
      taxId?: string;
      compareAtPrice?: number;
      isActive: boolean;
    }>;
  }>;
  marketplaces: Array<{ value: string; label: string }>;
  taxes: Array<{ value: string; label: string }>;
  currencies: Array<{ value: string; label: string }>;
  bulkEditMode?: boolean;
  selectedVariants?: string[];
  onUpdatePricing?: (variantId: string, marketplaceId: string, updates: any) => void;
  onBulkUpdate?: (updates: any) => void;
}

export function PricingMatrix({
  variants,
  marketplaces,
  taxes,
  currencies,
  bulkEditMode = false,
  selectedVariants = [],
  onUpdatePricing = () => {},
  onBulkUpdate = () => {}
}: PricingMatrixProps) {
  const [editingCell, setEditingCell] = useState<{variantId: string; marketplaceId: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('all');
  const [priceAdjustment, setPriceAdjustment] = useState({
    type: 'percentage', // 'percentage' or 'fixed'
    value: '',
    operation: 'increase' // 'increase' or 'decrease'
  });

  // Get all unique marketplaces from variants
  const allMarketplaces = useMemo(() => {
    const marketplaceSet = new Set<string>();
    variants.forEach(variant => {
      variant.pricing.forEach(p => marketplaceSet.add(p.marketplaceId));
    });
    return Array.from(marketplaceSet).map(id => 
      marketplaces.find(m => m.value === id) || { value: id, label: id }
    );
  }, [variants, marketplaces]);

  // Filtered marketplaces
  const filteredMarketplaces = useMemo(() => {
    if (selectedMarketplace === 'all') return allMarketplaces;
    return allMarketplaces.filter(m => m.value === selectedMarketplace);
  }, [allMarketplaces, selectedMarketplace]);

  // Get price for a variant in a specific marketplace
  const getPrice = (variant: any, marketplaceId: string) => {
    const pricing = variant.pricing.find((p: any) => p.marketplaceId === marketplaceId);
    return pricing?.price || 0;
  };

  // Get currency for a marketplace
  const getCurrency = (marketplaceId: string) => {
    const marketplace = marketplaces.find(m => m.value === marketplaceId);
    const currency = currencies.find(c => c.value === marketplace?.value);
    return currency?.label || '$';
  };

  // Handle cell edit
  const handleCellClick = (variantId: string, marketplaceId: string, currentPrice: number) => {
    setEditingCell({ variantId, marketplaceId });
    setEditValue(currentPrice.toString());
  };

  const handleSaveEdit = () => {
    if (editingCell && editValue) {
      const price = parseFloat(editValue);
      if (!isNaN(price)) {
        onUpdatePricing(editingCell.variantId, editingCell.marketplaceId, { price });
      }
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Apply price adjustment to selected variants
  const handlePriceAdjustment = () => {
    if (!priceAdjustment.value) {
      alert("Please enter adjustment value");
      return;
    }

    const value = parseFloat(priceAdjustment.value);
    if (isNaN(value)) {
      alert("Please enter a valid number");
      return;
    }

    const updates: any = {};

    if (priceAdjustment.type === 'percentage') {
      updates.price = (prev: number) => {
        if (priceAdjustment.operation === 'increase') {
          return prev * (1 + value / 100);
        } else {
          return prev * (1 - value / 100);
        }
      };
    } else {
      updates.price = (prev: number) => {
        if (priceAdjustment.operation === 'increase') {
          return prev + value;
        } else {
          return prev - value;
        }
      };
    }

    onBulkUpdate(updates);
    
    // Reset adjustment
    setPriceAdjustment({
      type: 'percentage',
      value: '',
      operation: 'increase'
    });
  };

  // Copy prices from one marketplace to others
  const handleCopyPrices = (sourceMarketplaceId: string) => {
    const updates: any = {};
    allMarketplaces.forEach(targetMarketplace => {
      if (targetMarketplace.value !== sourceMarketplaceId) {
        updates[targetMarketplace.value] = { copyFrom: sourceMarketplaceId };
      }
    });
    
    // This would need custom logic to copy prices
    console.log('Copy prices from:', sourceMarketplaceId);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const statsByMarketplace: Record<string, {
      min: number;
      max: number;
      avg: number;
      total: number;
    }> = {};

    allMarketplaces.forEach(marketplace => {
      const prices = variants.map(v => getPrice(v, marketplace.value)).filter(p => p > 0);
      
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const total = prices.reduce((sum, p) => sum + p, 0);

        statsByMarketplace[marketplace.value] = { min, max, avg, total };
      }
    });

    return statsByMarketplace;
  }, [variants, allMarketplaces]);

  // Get attribute summary for a variant
  const getAttributeSummary = (variant: any) => {
    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <Card className="border-2 border-green-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Pricing Matrix</h3>
              <p className="text-sm text-gray-600">
                Manage pricing across {allMarketplaces.length} marketplace{allMarketplaces.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Marketplace Filter */}
            <Select
              value={selectedMarketplace}
              onValueChange={setSelectedMarketplace}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter marketplace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Marketplaces</SelectItem>
                {allMarketplaces.map(marketplace => (
                  <SelectItem key={marketplace.value} value={marketplace.value}>
                    {marketplace.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export Button */}
            <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
              <Grid className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Price Adjustment Toolbar */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Bulk Price Adjustment
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                Adjust prices for {bulkEditMode ? `${selectedVariants.length} selected variants` : 'all variants'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={priceAdjustment.type}
                onValueChange={(value: any) => setPriceAdjustment(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priceAdjustment.operation}
                onValueChange={(value: any) => setPriceAdjustment(prev => ({ ...prev, operation: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase</SelectItem>
                  <SelectItem value="decrease">Decrease</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                {priceAdjustment.type === 'percentage' ? (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Percent className="h-4 w-4 text-gray-400" />
                  </div>
                ) : (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <Input
                  type="number"
                  value={priceAdjustment.value}
                  onChange={(e) => setPriceAdjustment(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={priceAdjustment.type === 'percentage' ? "10" : "5.00"}
                  className={`pl-10 w-32 ${priceAdjustment.type === 'percentage' ? 'pr-10' : ''}`}
                  min="0"
                  step={priceAdjustment.type === 'percentage' ? "1" : "0.01"}
                />
                {priceAdjustment.type === 'percentage' && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-gray-400">%</span>
                  </div>
                )}
              </div>

              <button
                onClick={handlePriceAdjustment}
                disabled={!priceAdjustment.value}
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
              onClick={() => {
                setPriceAdjustment({ type: 'percentage', value: '10', operation: 'increase' });
                handlePriceAdjustment();
              }}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center gap-2"
            >
              <TrendingUp className="h-3 w-3" />
              +10%
            </button>
            <button
              onClick={() => {
                setPriceAdjustment({ type: 'percentage', value: '10', operation: 'decrease' });
                handlePriceAdjustment();
              }}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
            >
              <TrendingDown className="h-3 w-3" />
              -10%
            </button>
            <button
              onClick={() => {
                setPriceAdjustment({ type: 'fixed', value: '5', operation: 'increase' });
                handlePriceAdjustment();
              }}
              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-2"
            >
              <DollarSign className="h-3 w-3" />
              +$5
            </button>
            <button
              onClick={() => {
                setPriceAdjustment({ type: 'fixed', value: '5', operation: 'decrease' });
                handlePriceAdjustment();
              }}
              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center gap-2"
            >
              <DollarSign className="h-3 w-3" />
              -$5
            </button>
          </div>
        </div>

        {/* Marketplace Statistics */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMarketplaces.map(marketplace => {
            const stat = stats[marketplace.value];
            if (!stat) return null;

            return (
              <div key={marketplace.value} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-800">{marketplace.label}</h5>
                  <Badge className="bg-green-100 text-green-800">
                    {getCurrency(marketplace.value)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-600">Min</div>
                    <div className="font-bold text-gray-800">${stat.min.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Max</div>
                    <div className="font-bold text-gray-800">${stat.max.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Avg</div>
                    <div className="font-bold text-blue-600">${stat.avg.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Total</div>
                    <div className="font-bold text-purple-600">${stat.total.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => handleCopyPrices(marketplace.value)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy to others
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Variant / SKU
                </th>
                {filteredMarketplaces.map(marketplace => (
                  <th key={marketplace.value} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-600" />
                      {marketplace.label}
                      <Badge className="ml-1 bg-green-100 text-green-800 text-xs">
                        {getCurrency(marketplace.value)}
                      </Badge>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
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
                      <div className="text-xs text-gray-600 mt-1 truncate max-w-xs">
                        {getAttributeSummary(variant)}
                      </div>
                    </div>
                  </td>

                  {/* Marketplace Prices */}
                  {filteredMarketplaces.map(marketplace => {
                    const price = getPrice(variant, marketplace.value);
                    const isEditing = editingCell?.variantId === variant.id && 
                                     editingCell?.marketplaceId === marketplace.value;

                    return (
                      <td key={`${variant.id}-${marketplace.value}`} className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="pl-10 w-32"
                                autoFocus
                                min="0"
                                step="0.01"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                              />
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title="Save"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="group">
                            <button
                              onClick={() => handleCellClick(variant.id, marketplace.value, price)}
                              className="w-full text-left p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-between"
                            >
                              <span className={`font-medium ${
                                price === 0 ? 'text-gray-400' : 'text-gray-800'
                              }`}>
                                {price === 0 ? 'Not set' : `${getCurrency(marketplace.value)}${price.toFixed(2)}`}
                              </span>
                              <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const avgPrice = filteredMarketplaces.reduce((sum, m) => 
                            sum + getPrice(variant, m.value), 0
                          ) / filteredMarketplaces.length;
                          
                          filteredMarketplaces.forEach(marketplace => {
                            onUpdatePricing(variant.id, marketplace.value, { price: avgPrice });
                          });
                        }}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                        title="Set all to average"
                      >
                        Average
                      </button>
                      <button
                        onClick={() => {
                          filteredMarketplaces.forEach(marketplace => {
                            onUpdatePricing(variant.id, marketplace.value, { price: 0 });
                          });
                        }}
                        className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                        title="Clear all prices"
                      >
                        Clear
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {variants.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="inline-block mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">No variants with pricing</h4>
            <p className="text-gray-500">
              Add pricing to your variants to see them in the matrix
            </p>
          </div>
        )}

        {/* Footer Summary */}
        {variants.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {variants.length} variant{variants.length !== 1 ? 's' : ''} across {filteredMarketplaces.length} marketplace{filteredMarketplaces.length !== 1 ? 's' : ''}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Total Value: </span>
                  <span className="font-bold text-green-600">
                    ${Object.values(stats).reduce((sum, stat) => sum + stat.total, 0).toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    // Refresh all prices
                    console.log('Refresh prices');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
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