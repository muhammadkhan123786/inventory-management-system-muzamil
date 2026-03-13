// components/variants/VariantGenerator.tsx
"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown,
  Zap,
  Grid3x3,
  Calculator,
  Hash,
  Tag
} from 'lucide-react';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { Input } from '@/components/form/Input';
import { Switch } from '@/components/form/Switch';

interface VariantGeneratorProps {
  attributes: Array<{
    _id: string;
    attributeName: string;
    values?: Array<{ id: string; value: string; label?: string }>;
    isVariantAttribute?: boolean;
  }>;
  onBulkGenerate: (
    attributes: any[], 
    basePricing: any[], 
    baseStock: any[]
  ) => void;
  marketplaces: Array<{ value: string; label: string }>;
  currencies: Array<{ value: string; label: string }>;
  taxes: Array<{ value: string; label: string }>;
  warehouses: Array<{ value: string; label: string }>;
  productStatus: Array<{ value: string; label: string }>;
  conditions: Array<{ value: string; label: string }>;
}

export function VariantGenerator({
  attributes,
  onBulkGenerate,
  marketplaces,
  currencies,
  taxes,
  warehouses,
  productStatus,
  conditions
}: VariantGeneratorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [basePrice, setBasePrice] = useState<string>('29.99');
  const [baseCost, setBaseCost] = useState<string>('15.00');
  const [baseStock, setBaseStock] = useState<string>('100');
  const [skuPrefix, setSkuPrefix] = useState<string>('VAR');
  const [autoGenerateSKU, setAutoGenerateSKU] = useState<boolean>(true);

  // Calculate total possible combinations
  const totalCombinations = useMemo(() => {
    if (selectedAttributes.length === 0) return 0;
    
    return selectedAttributes.reduce((total, attrId) => {
      const attr = attributes.find(a => a._id === attrId);
      const valueCount = attr?.values?.length || 1;
      return total * valueCount;
    }, 1);
  }, [selectedAttributes, attributes]);

  // Get variant attributes (those with values)
  const variantAttributes = useMemo(() => {
    return attributes.filter(attr => 
      attr.values && attr.values.length > 0
    );
  }, [attributes]);

  console.log('selectedAttributes', selectedAttributes);
  console.log('attributes', attributes);
  // Toggle attribute selection
  const toggleAttribute = (attrId: string) => {
    setSelectedAttributes(prev =>
      prev.includes(attrId)
        ? prev.filter(id => id !== attrId)
        : [...prev, attrId]
    );
  };

  // Handle bulk generation
  const handleGenerate = () => {
    if (selectedAttributes.length === 0) {
      alert("Please select at least one attribute for variants");
      return;
    }

    if (totalCombinations > 100) {
      const confirm = window.confirm(
        `This will generate ${totalCombinations} variants. This might be a lot. Continue?`
      );
      if (!confirm) return;
    }

    // Prepare variant attributes
    const variantAttributesArray = selectedAttributes
      .map(attrId => {
        const attr = attributes.find(a => a._id === attrId);
        if (!attr) return null;
        return {
          id: attr._id,
          name: attr.attributeName,
          values: attr.values || []
        };
      })
      

    // Base pricing for all marketplaces
    const basePricing = marketplaces.map(mp => ({
      marketplaceId: mp.value,
      price: parseFloat(basePrice) || 0,
      currency: currencies[0]?.value || 'USD',
      taxId: taxes[0]?.value,
      compareAtPrice: (parseFloat(basePrice) || 0) * 1.2,
      isActive: true
    }));

    // Base stock for all warehouses
    const baseStockConfig = warehouses.map(wh => ({
      warehouseId: wh.value,
      quantity: parseInt(baseStock) || 0,
      statusId: productStatus[0]?.value,
      conditionId: conditions[0]?.value,
      location: 'Default Location',
      reorderPoint: 10
    }));

    // Generate SKU pattern
    const skuPattern = autoGenerateSKU ? `${skuPrefix}-{attr1}-{attr2}-{num}` : '';
console.log('Generating variants with attributes:', variantAttributesArray);
console.log('SkuPattern:', skuPattern);
    onBulkGenerate(variantAttributesArray, basePricing, baseStockConfig);
  };

  // Select all attributes
  const selectAllAttributes = () => {
    if (selectedAttributes.length === variantAttributes.length) {
      setSelectedAttributes([]);
    } else {
      setSelectedAttributes(variantAttributes.map(attr => attr._id));
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedAttributes([]);
    setBasePrice('29.99');
    setBaseCost('15.00');
    setBaseStock('100');
    setShowAdvanced(false);
  };

  // Calculate profit margin
  const profitMargin = useMemo(() => {
    const price = parseFloat(basePrice) || 0;
    const cost = parseFloat(baseCost) || 0;
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  }, [basePrice, baseCost]);
console.log('Rendering VariantGenerator', attributes);
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Generate Variants</h3>
              <p className="text-sm text-gray-600">
                Select attributes to automatically create all combinations
              </p>
            </div>
          </div>
          
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            {variantAttributes.length} Available
          </Badge>
        </div>

        {/* Attribute Selection */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-semibold text-gray-700">Select Variant Attributes</h4>
              <button
                onClick={selectAllAttributes}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedAttributes.length === variantAttributes.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {selectedAttributes.length} of {variantAttributes.length} selected
            </span>
          </div>

          {variantAttributes.length === 0 ? (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  No variant attributes available. Add attributes with values first.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {variantAttributes.map((attr) => {
                const isSelected = selectedAttributes.includes(attr._id);
                const valueCount = attr.values?.length || 0;
                
                return (
                  <motion.button
                    key={attr._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleAttribute(attr._id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className={`font-medium ${
                            isSelected ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {attr.attributeName}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Grid3x3 className="h-3 w-3" />
                          <span>{valueCount} option{valueCount !== 1 ? 's' : ''}</span>
                        </div>
                        
                        {/* Value preview */}
                        {isSelected && attr.values && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Values:</p>
                            <div className="flex flex-wrap gap-1">
                              {attr.values.slice(0, 3).map((val, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-700 text-xs">
                                  {val.label || val.value}
                                </Badge>
                              ))}
                              {attr.values.length > 3 && (
                                <Badge className="bg-gray-100 text-gray-600 text-xs">
                                  +{attr.values.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Badge className={`ml-2 ${
                        isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {valueCount}
                      </Badge>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Combination Preview */}
        {selectedAttributes.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-green-600" />
                  Combination Preview
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  This will generate {totalCombinations} unique variant{totalCombinations !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">{totalCombinations}</div>
                <div className="text-xs text-gray-600">Total Variants</div>
              </div>
            </div>
            
            {/* Attribute combinations preview */}
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Attributes selected:</p>
              <div className="flex flex-wrap gap-2">
                {selectedAttributes.map(attrId => {
                  const attr = attributes.find(a => a._id === attrId);
                  return (
                    <Badge key={attrId} className="bg-white border border-green-200 text-green-700">
                      {attr?.attributeName} ({attr?.values?.length || 0})
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="space-y-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-700">Advanced Configuration</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
              showAdvanced ? 'rotate-180' : ''
            }`} />
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
                {/* Pricing Settings */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" />
                    Base Pricing
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Price
                      </label>
                      <Input
                        type="number"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="29.99"
                        min="0"
                        step="0.01"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Cost
                      </label>
                      <Input
                        type="number"
                        value={baseCost}
                        onChange={(e) => setBaseCost(e.target.value)}
                        placeholder="15.00"
                        min="0"
                        step="0.01"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profit Margin
                      </label>
                      <div className="p-2 bg-gray-50 rounded border border-gray-200 text-center">
                        <div className={`text-lg font-bold ${
                          profitMargin >= 30 ? 'text-green-600' : 
                          profitMargin >= 20 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {profitMargin.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Margin</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Settings */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-600" />
                    Base Stock
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity
                      </label>
                      <Input
                        type="number"
                        value={baseStock}
                        onChange={(e) => setBaseStock(e.target.value)}
                        placeholder="100"
                        min="0"
                        step="1"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU Settings
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={autoGenerateSKU}
                            onCheckedChange={setAutoGenerateSKU}
                          />
                          <span className="text-sm text-gray-700">Auto-generate SKU</span>
                        </div>
                        
                        {autoGenerateSKU && (
                          <Input
                            type="text"
                            value={skuPrefix}
                            onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                            placeholder="VAR"
                            className="w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {totalCombinations > 0 && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalCombinations}</div>
                    <div className="text-xs text-gray-600">Total Variants</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">
                      ${(parseFloat(basePrice) - parseFloat(baseCost)).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Profit each</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-600">
                      ${(totalCombinations * parseFloat(basePrice)).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Total Value</div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={selectedAttributes.length === 0 && !showAdvanced}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              
              <button
                type="button"
                onClick={handleGenerate}
                disabled={selectedAttributes.length === 0}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate 
              </button>
            </div>
          </div>
        </div>

        {/* Warning for large combinations */}
        {totalCombinations > 50 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Generating {totalCombinations} variants may take a moment. 
                Consider using bulk edit features after generation for fine-tuning.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}