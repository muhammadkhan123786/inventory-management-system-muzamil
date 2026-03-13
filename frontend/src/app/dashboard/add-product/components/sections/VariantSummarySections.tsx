// components/sections/VariantSummary.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/form/Badge';
import { Edit, Trash2, AlertCircle, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MarketplacePricing {
  id: string;
  marketplaceId: string;
  marketplaceName: string;
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  discountPercentage: number;
  taxId: string;
  taxRate: number;
  vatExempt: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, any>;
  marketplacePricing: MarketplacePricing[];
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  stockLocation: string;
  warehouseId: string;
  binLocation: string;
  productStatusId: string;
  conditionId: string;
  warehouseStatusId: string;
  featured: boolean;
  safetyStock?: number;
  leadTimeDays?: number;
  warranty: string;
  warrantyPeriod: string;
  supplierId: string;
}

interface VariantSummaryProps {
  variants: ProductVariant[];
  attributes: any[];
  currencySymbol: string;
  productStatus: any[];
  conditions: any[];
  onEditVariant: (variant: ProductVariant) => void;
  onDeleteVariant: (id: string) => void;
}

export function VariantSummary({
  variants,
  attributes,
  currencySymbol,
  productStatus,
  conditions,
  onEditVariant,
  onDeleteVariant,
}: VariantSummaryProps) {
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());

  const toggleExpand = (variantId: string) => {
    setExpandedVariants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(variantId)) {
        newSet.delete(variantId);
      } else {
        newSet.add(variantId);
      }
      return newSet;
    });
  };

  const getAttributeLabel = (fieldId: string, value: any): string => {
    const field = attributes.find(a => a._id === fieldId);
    if (!field) return String(value);

    if (field.type === 'select' || field.type === 'dropdown') {
      const option = field.options?.find((opt: any) => opt._id === value || opt.value === value);
      return option?.label || option?.name || String(value);
    }

    return String(value);
  };

  const calculatePricing = (pricing: MarketplacePricing) => {
    const cost = (pricing.costPrice || 0);
    const selling = (pricing.sellingPrice || 0);
    const profit = selling - cost;
    const margin = selling > 0 ? (profit / selling) * 100 : 0;

    return { cost, selling, profit, margin };
  };

  return (
    <>
      <div className="space-y-4">
        <AnimatePresence>
          {variants.map((variant, index) => {
            const isExpanded = expandedVariants.has(variant.id);
            const isLowStock = (variant.stockQuantity) < (variant.minStockLevel || 0);

            return (
              <motion.div
                key={variant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-r from-white to-gray-50 rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-all overflow-hidden"
              >
                {/* Variant Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Variant Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-blue-500 text-white font-mono">
                          {variant.sku || 'No SKU'}
                        </Badge>
                        {variant.featured && (
                          <Badge className="bg-orange-500 text-white">
                            Featured
                          </Badge>
                        )}
                        {isLowStock && (
                          <Badge className="bg-red-500 text-white flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Low Stock
                          </Badge>
                        )}
                      </div>

                      {/* Attributes */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(variant.attributes).map(([fieldId, value]) => {
                          const field = attributes.find(a => a._id === fieldId);
                          if (!field) return null;

                          return (
                            <Badge
                              key={fieldId}
                              className="bg-purple-100 text-purple-800 text-xs"
                            >
                              {field.attributeName}: {getAttributeLabel(fieldId, value)}
                            </Badge>
                          );
                        })}
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">Stock</p>
                          <p className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {variant.stockQuantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Marketplaces</p>
                          <p className="font-bold text-green-700">
                            {variant.marketplacePricing?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Warranty</p>
                          <p className="font-semibold text-gray-900">
                            {variant.warrantyPeriod ? variant.warrantyPeriod.replace('-', ' ') : 'None'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Avg. Margin</p>
                          <p className="font-bold text-teal-700">
                            {variant.marketplacePricing && variant.marketplacePricing.length > 0
                              ? (variant.marketplacePricing.reduce((sum, p) => {
                                const { margin } = calculatePricing(p);
                                return sum + margin;
                              }, 0) / variant.marketplacePricing.length).toFixed(1)
                              : '0'}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(variant.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={isExpanded ? 'Collapse details' : 'Expand details'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditVariant(variant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit variant"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteVariant(variant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete variant"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2 border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-white">
                        {/* Marketplace Pricing Details */}
                        <div className="mb-4">
                          <h6 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Store className="h-4 w-4 text-green-600" />
                            Marketplace Pricing ({variant.marketplacePricing?.length || 0})
                          </h6>

                          {variant.marketplacePricing && variant.marketplacePricing.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {variant.marketplacePricing.map((pricing) => {
                                const { cost, selling, profit, margin } = calculatePricing(pricing);

                                return (
                                  <div
                                    key={pricing.id}
                                    className="p-3 bg-white rounded-lg border-2 border-green-200"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h6 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                        <Store className="h-3 w-3 text-green-600" />
                                        {pricing.marketplaceName}
                                      </h6>
                                      {pricing.vatExempt && (
                                        <Badge className="bg-green-500 text-white text-xs">
                                          VAT Exempt
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <p className="text-gray-600">Cost</p>
                                        <p className="font-semibold text-gray-900">
                                          {currencySymbol}{cost.toFixed(2)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Selling</p>
                                        <p className="font-bold text-green-700">
                                          {currencySymbol}{selling.toFixed(2)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Profit</p>
                                        <p className={`font-semibold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                          {currencySymbol}{profit.toFixed(2)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Margin</p>
                                        <p className={`font-bold ${margin >= 0 ? 'text-teal-700' : 'text-red-700'}`}>
                                          {margin.toFixed(1)}%
                                        </p>
                                      </div>
                                    </div>

                                    {pricing.discountPercentage && pricing.discountPercentage > 0 && (
                                      <div className="mt-2">
                                        <Badge className="bg-orange-500 text-white text-xs">
                                          {pricing.discountPercentage}% Discount
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No marketplace pricing configured</p>
                          )}
                        </div>

                        {/* Inventory Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h6 className="text-xs font-bold text-gray-700 mb-2">Inventory</h6>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Stock Quantity:</span>
                                <span className="font-semibold">{variant.stockQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Min Level:</span>
                                <span className="font-semibold">{variant.minStockLevel || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Max Level:</span>
                                <span className="font-semibold">{variant.maxStockLevel || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Reorder Point:</span>
                                <span className="font-semibold">{variant.reorderPoint || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h6 className="text-xs font-bold text-gray-700 mb-2">Location & Status</h6>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Stock Location:</span>
                                <span className="font-semibold">{variant.stockLocation || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Bin Location:</span>
                                <span className="font-semibold">{variant.binLocation || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Warranty:</span>
                                <span className="font-semibold">
                                  {variant.warranty || 'None'}
                                  {variant.warrantyPeriod && ` (${variant.warrantyPeriod.replace('-', ' ')})`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600">Total Variants</p>
            <p className="text-2xl font-bold text-blue-900">{variants.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Stock</p>
            <p className="text-2xl font-bold text-green-900">
              {variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Marketplaces</p>
            <p className="text-2xl font-bold text-teal-900">
              {Math.max(...variants.map(v => v.marketplacePricing?.length || 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Featured</p>
            <p className="text-2xl font-bold text-orange-900">
              {variants.filter(v => v.featured).length}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}