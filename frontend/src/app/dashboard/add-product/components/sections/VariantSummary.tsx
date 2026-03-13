// components/steps/variant-sections/VariantSummary.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/form/Badge';
import { 
  CheckCircle, AlertCircle, Edit, Trash2,
  PackageCheck, TrendingUp, TrendingDown, AlertTriangle, Package
} from 'lucide-react';

interface VariantSummaryProps {
  variants: any[];
  attributes: any[];
  currencySymbol: string;
  productStatus: any[];
  conditions: any[];
  onEditVariant: (variant: any) => void;
  onDeleteVariant: (id: string) => void;
}

export interface OptionType {
  _id?: string;
  value: string;
  label: string;
  name?: string;
  sort?: number;
}
export function VariantSummary({
  variants,
  attributes,
  currencySymbol = '£',
  productStatus = [],
  conditions = [],
  onEditVariant,
  onDeleteVariant,
}: VariantSummaryProps) {
  // Calculate pricing for a variant
  const calculatePricing = (variant: any) => {
    const cost = parseFloat(variant.costPrice || '0');
    const selling = parseFloat(variant.sellingPrice || '0');
    const profit = selling - cost;
    const margin = selling > 0 ? (profit / selling) * 100 : 0;
    return { cost, selling, profit, margin };
  };

  // Calculate stock status
  const calculateStockStatus = (variant: any) => {
    const stockQuantity = parseInt(variant.stockQuantity || '0');
    const minStockLevel = parseInt(variant.minStockLevel || '0');
    const reorderPoint = parseInt(variant.reorderPoint || '0');
    
    const isLowStock = minStockLevel > 0 && stockQuantity < minStockLevel;
    const isCriticalStock = reorderPoint > 0 && stockQuantity <= reorderPoint;
    
    return { stockQuantity, isLowStock, isCriticalStock };
  };

  // Get attribute label
  const getAttributeLabel = (fieldId: string, value: any): string => {
    const field = attributes.find(a => a._id === fieldId);
    if (!field) return String(value);

    if (field.type === 'select' || field.type === 'dropdown') {
      const option = field.options?.find((opt: OptionType) => opt._id === value || opt.value === value);
      return option?.label || option?.name || String(value);
    }

    return String(value);
  };

  // Get stock icon
  const getStockIcon = (variant: any) => {
    const { stockQuantity, isLowStock, isCriticalStock } = calculateStockStatus(variant);
    
    if (stockQuantity === 0) return AlertTriangle;
    if (isCriticalStock) return AlertTriangle;
    if (isLowStock) return TrendingDown;
    return PackageCheck;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-orange-100 to-amber-100 border-b-2 border-orange-300">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
              Attributes
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
              Pricing
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {variants.map((variant, index) => {
              const { cost, selling, profit, margin } = calculatePricing(variant);
              const { stockQuantity, isLowStock } = calculateStockStatus(variant);
              const StockIcon = getStockIcon(variant);

              return (
                <motion.tr
                  key={variant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {Object.entries(variant.attributes).map(([fieldId, value]) => {
                        const field = attributes.find(a => a._id === fieldId);
                        if (!field) return null;
                        
                        return (
                          <Badge
                            key={fieldId}
                            className="bg-blue-100 text-blue-800 text-xs"
                          >
                            {field.attributeName}: {getAttributeLabel(fieldId, value)}
                          </Badge>
                        );
                      })}
                    </div>
                    {variant.sku && (
                      <div className="text-xs text-gray-500">SKU: {variant.sku}</div>
                    )}
                    {variant.featured && (
                      <Badge className="bg-orange-500 text-white text-xs mt-1">
                        Featured
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Cost:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {currencySymbol}{cost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Selling:</span>
                        <span className="text-sm font-bold text-green-700">
                          {currencySymbol}{selling.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Profit:</span>
                        <span className={`text-xs font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {currencySymbol}{profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Margin:</span>
                        <span className={`text-xs font-bold ${margin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StockIcon className="h-4 w-4 text-gray-500" />
                        <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                          {stockQuantity}
                        </span>
                        {isLowStock && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {variant.minStockLevel && (
                        <div className="text-xs text-gray-500">
                          Min: {variant.minStockLevel}
                        </div>
                      )}
                      {variant.reorderPoint && (
                        <div className="text-xs text-gray-500">
                          Reorder: {variant.reorderPoint}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${
                          variant.productStatusId === 'active' ? 'bg-green-500' : 
                          variant.productStatusId === 'draft' ? 'bg-yellow-500' : 
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-700">
                          {productStatus?.find(s => s.value === variant.productStatusId)?.label || 'Draft'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {conditions?.find(c => c.value === variant.conditionId)?.label || 'New'}
                      </div>
                      {variant.warrantyPeriod && variant.warrantyPeriod !== 'No Warranty' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {variant.warrantyPeriod.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditVariant(variant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit variant"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteVariant(variant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete variant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}