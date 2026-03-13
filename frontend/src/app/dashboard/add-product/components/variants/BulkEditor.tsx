// components/variants/BulkEditor.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  DollarSign, 
  Package, 
  Percent,
  TrendingUp,
  Save,
  X,
  Copy,
  Globe,
  Shield,
  MapPin,
  Target,
  AlertTriangle,
  Check,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/form/Card';
import { Input } from '@/components/form/Input';
import { Textarea } from '@/components/form/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";
import { Badge } from '@/components/form/Badge';
import { Switch } from '@/components/form/Switch';
// import { RadioGroup, RadioGroupItem } from '@/components/form/RadioGroup';

interface BulkEditorProps {
  selectedCount: number;
  onBulkUpdatePricing: (updates: any) => void;
  onBulkUpdateStock: (updates: any) => void;
  currencies: Array<{ value: string; label: string }>;
  taxes: Array<{ value: string; label: string }>;
  warehouses: Array<{ value: string; label: string }>;
  productStatus: Array<{ value: string; label: string }>;
  conditions: Array<{ value: string; label: string }>;
}

type BulkUpdateMode = 'pricing' | 'stock' | 'status' | 'all';

export function BulkEditor({
  selectedCount,
  onBulkUpdatePricing,
  onBulkUpdateStock,
  currencies,
  taxes,
  warehouses,
  productStatus,
  conditions
}: BulkEditorProps) {
  const [mode, setMode] = useState<BulkUpdateMode>('pricing');
  const [pricingUpdates, setPricingUpdates] = useState({
    operation: 'set', // 'set', 'increase', 'decrease', 'percentage'
    value: '',
    applyTo: 'all', // 'all', 'specific'
    specificMarketplace: '',
    currency: '',
    taxId: '',
    compareAtPrice: '',
    isActive: true
  });
  
  const [stockUpdates, setStockUpdates] = useState({
    operation: 'set', // 'set', 'increase', 'decrease'
    value: '',
    applyTo: 'all', // 'all', 'specific'
    specificWarehouse: '',
    statusId: '',
    conditionId: '',
    location: '',
    reorderPoint: ''
  });

  const [statusUpdates, setStatusUpdates] = useState({
    isActive: true,
    productStatusId: '',
    conditionId: '',
    notes: ''
  });

  // Handle pricing update
  const handlePricingUpdate = () => {
    if (!pricingUpdates.value && pricingUpdates.operation !== 'clear') {
      alert("Please enter a value");
      return;
    }

    const updates: any = {};
    
    // Price operation
    if (pricingUpdates.operation !== 'clear') {
      switch (pricingUpdates.operation) {
        case 'set':
          updates.price = parseFloat(pricingUpdates.value);
          break;
        case 'increase':
          updates.price = (prev: number) => prev + parseFloat(pricingUpdates.value);
          break;
        case 'decrease':
          updates.price = (prev: number) => prev - parseFloat(pricingUpdates.value);
          break;
        case 'percentage':
          updates.price = (prev: number) => prev * (1 + parseFloat(pricingUpdates.value) / 100);
          break;
      }
    }

    // Apply to specific marketplace
    if (pricingUpdates.applyTo === 'specific' && pricingUpdates.specificMarketplace) {
      updates.marketplaceId = pricingUpdates.specificMarketplace;
    }

    if (pricingUpdates.currency) {
      updates.currency = pricingUpdates.currency;
    }
    
    if (pricingUpdates.taxId) {
      updates.taxId = pricingUpdates.taxId;
    }
    
    if (pricingUpdates.compareAtPrice) {
      updates.compareAtPrice = parseFloat(pricingUpdates.compareAtPrice);
    }
    
    updates.isActive = pricingUpdates.isActive;

    onBulkUpdatePricing(updates);
    
    // Show success message
    alert(`Updated pricing for ${selectedCount} variants`);
  };

  // Handle stock update
  const handleStockUpdate = () => {
    if (!stockUpdates.value && stockUpdates.operation === 'set') {
      alert("Please enter a quantity value");
      return;
    }

    const updates: any = {};
    
    // Quantity operation
    if (stockUpdates.operation !== 'clear') {
      switch (stockUpdates.operation) {
        case 'set':
          updates.quantity = parseInt(stockUpdates.value) || 0;
          break;
        case 'increase':
          updates.quantity = (prev: number) => prev + parseInt(stockUpdates.value || '0');
          break;
        case 'decrease':
          updates.quantity = (prev: number) => prev - parseInt(stockUpdates.value || '0');
          break;
      }
    }

    if (stockUpdates.statusId && stockUpdates.statusId !== '__keep__') {
  updates.statusId = stockUpdates.statusId;
}

if (stockUpdates.conditionId && stockUpdates.conditionId !== '__keep__') {
  updates.conditionId = stockUpdates.conditionId;
}


    // Apply to specific warehouse
    if (stockUpdates.applyTo === 'specific' && stockUpdates.specificWarehouse) {
      updates.warehouseId = stockUpdates.specificWarehouse;
    }

    if (stockUpdates.statusId) {
      updates.statusId = stockUpdates.statusId;
    }
    
    if (stockUpdates.conditionId) {
      updates.conditionId = stockUpdates.conditionId;
    }
    
    if (stockUpdates.location) {
      updates.location = stockUpdates.location;
    }
    
    if (stockUpdates.reorderPoint) {
      updates.reorderPoint = parseInt(stockUpdates.reorderPoint) || 0;
    }

    onBulkUpdateStock(updates);
    alert(`Updated stock for ${selectedCount} variants`);
  };

  // Handle status update
  const handleStatusUpdate = () => {
    const updates: any = {
      isActive: statusUpdates.isActive
    };
    
    if (statusUpdates.productStatusId) {
      updates.productStatusId = statusUpdates.productStatusId;
    }
    
    if (statusUpdates.conditionId) {
      updates.conditionId = statusUpdates.conditionId;
    }

    // Apply both pricing and stock updates for status
    onBulkUpdatePricing({ isActive: statusUpdates.isActive });
    onBulkUpdateStock(updates);
    
    alert(`Updated status for ${selectedCount} variants`);
  };

  // Handle all updates
  const handleAllUpdates = () => {
    handlePricingUpdate();
    handleStockUpdate();
    handleStatusUpdate();
  };

  // Quick action: Set zero stock
  const handleSetZeroStock = () => {
    onBulkUpdateStock({ quantity: 0 });
    alert(`Set stock to 0 for ${selectedCount} variants`);
  };

  // Quick action: Activate all
  const handleActivateAll = () => {
    onBulkUpdatePricing({ isActive: true });
    alert(`Activated ${selectedCount} variants`);
  };

  // Quick action: Deactivate all
  const handleDeactivateAll = () => {
    onBulkUpdatePricing({ isActive: false });
    alert(`Deactivated ${selectedCount} variants`);
  };

  // Quick action: 10% price increase
  const handlePriceIncrease10 = () => {
    onBulkUpdatePricing({ 
      price: (prev: number) => prev * 1.1 
    });
    alert(`Increased prices by 10% for ${selectedCount} variants`);
  };

  // Quick action: 10% price decrease
  const handlePriceDecrease10 = () => {
    onBulkUpdatePricing({ 
      price: (prev: number) => prev * 0.9 
    });
    alert(`Decreased prices by 10% for ${selectedCount} variants`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Bulk Editor</h3>
                <p className="text-sm text-gray-600">
                  Editing {selectedCount} selected variant{selectedCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {selectedCount} Selected
              </Badge>
              <button
                onClick={() => {
                  setPricingUpdates({
                    operation: 'set',
                    value: '',
                    applyTo: 'all',
                    specificMarketplace: '',
                    currency: '',
                    taxId: '',
                    compareAtPrice: '',
                    isActive: true
                  });
                  setStockUpdates({
                    operation: 'set',
                    value: '',
                    applyTo: 'all',
                    specificWarehouse: '',
                    statusId: '',
                    conditionId: '',
                    location: '',
                    reorderPoint: ''
                  });
                  setStatusUpdates({
                    isActive: true,
                    productStatusId: '',
                    conditionId: '',
                    notes: ''
                  });
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
                title="Reset forms"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex flex-wrap border-b border-gray-200 mb-6">
            {(['pricing', 'stock', 'status', 'all'] as BulkUpdateMode[]).map((tabMode) => (
              <button
                key={tabMode}
                type="button"
                onClick={() => setMode(tabMode)}
                className={`px-4 py-3 font-medium text-center border-b-2 transition-colors flex-1 min-w-[120px] ${
                  mode === tabMode
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tabMode === 'pricing' && <DollarSign className="h-4 w-4" />}
                  {tabMode === 'stock' && <Package className="h-4 w-4" />}
                  {tabMode === 'status' && <Shield className="h-4 w-4" />}
                  {tabMode === 'all' && <TrendingUp className="h-4 w-4" />}
                  {tabMode.charAt(0).toUpperCase() + tabMode.slice(1)}
                </div>
              </button>
            ))}
          </div>

          {/* Pricing Editor */}
          {(mode === 'pricing' || mode === 'all') && (
            <div className="space-y-6 mb-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Bulk Pricing Update
                </h4>
                <span className="text-sm text-gray-500">Applies to {selectedCount} variants</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Operation
                    </label>
                    <Select
                      value={pricingUpdates.operation}
                      onValueChange={(value) => setPricingUpdates(prev => ({ 
                        ...prev, 
                        operation: value as any 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set to specific value</SelectItem>
                        <SelectItem value="increase">Increase by amount</SelectItem>
                        <SelectItem value="decrease">Decrease by amount</SelectItem>
                        <SelectItem value="percentage">Adjust by percentage</SelectItem>
                        <SelectItem value="clear">Clear pricing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {pricingUpdates.operation !== 'clear' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {pricingUpdates.operation === 'percentage' ? 'Percentage' : 'Amount'}
                      </label>
                      <div className="relative">
                        {pricingUpdates.operation === 'percentage' ? (
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
                          value={pricingUpdates.value}
                          onChange={(e) => setPricingUpdates(prev => ({ 
                            ...prev, 
                            value: e.target.value 
                          }))}
                          placeholder={pricingUpdates.operation === 'percentage' ? "10" : "0.00"}
                          className={`pl-10 ${pricingUpdates.operation === 'percentage' ? 'pr-10' : ''}`}
                          min="0"
                          step={pricingUpdates.operation === 'percentage' ? "1" : "0.01"}
                        />
                        {pricingUpdates.operation === 'percentage' && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-gray-400">%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apply To
                    </label>
                    {/* <RadioGroup
                      value={pricingUpdates.applyTo}
                      onValueChange={(value) => setPricingUpdates(prev => ({ 
                        ...prev, 
                        applyTo: value as any 
                      }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="all" id="all-marketplaces" />
                        <label htmlFor="all-marketplaces" className="text-sm">All Marketplaces</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="specific" id="specific-marketplace" />
                        <label htmlFor="specific-marketplace" className="text-sm">Specific Marketplace</label>
                      </div>
                    </RadioGroup> */}
                    
                    {pricingUpdates.applyTo === 'specific' && (
                      <div className="mt-2">
                        <Select
                          value={pricingUpdates.specificMarketplace}
                          onValueChange={(value) => setPricingUpdates(prev => ({ 
                            ...prev, 
                            specificMarketplace: value 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select marketplace" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                <div className="flex items-center gap-2">
                                  <Globe className="h-3 w-3" />
                                  {currency.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <Select
                      value={pricingUpdates.currency}
                      onValueChange={(value) => setPricingUpdates(prev => ({ 
                        ...prev, 
                        currency: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate
                    </label>
                    <Select
                      value={pricingUpdates.taxId}
                      onValueChange={(value) => setPricingUpdates(prev => ({ 
                        ...prev, 
                        taxId: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__keep__">No Tax</SelectItem>
                        {taxes.map((tax) => (
                          <SelectItem key={tax.value} value={tax.value}>
                            {tax.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compare-at Price
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        value={pricingUpdates.compareAtPrice}
                        onChange={(e) => setPricingUpdates(prev => ({ 
                          ...prev, 
                          compareAtPrice: e.target.value 
                        }))}
                        placeholder="0.00"
                        className="pl-10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pricingUpdates.isActive}
                        onCheckedChange={(checked) => setPricingUpdates(prev => ({ 
                          ...prev, 
                          isActive: checked 
                        }))}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Set as Active
                      </span>
                    </div>
                    
                    {mode === 'pricing' && (
                      <button
                        type="button"
                        onClick={handlePricingUpdate}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Apply Pricing
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stock Editor */}
          {(mode === 'stock' || mode === 'all') && (
            <div className="space-y-6 mb-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Bulk Stock Update
                </h4>
                <span className="text-sm text-gray-500">Applies to {selectedCount} variants</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity Operation
                    </label>
                    <Select
                      value={stockUpdates.operation}
                      onValueChange={(value) => setStockUpdates(prev => ({ 
                        ...prev, 
                        operation: value as any 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set to specific quantity</SelectItem>
                        <SelectItem value="increase">Increase by amount</SelectItem>
                        <SelectItem value="decrease">Decrease by amount</SelectItem>
                        <SelectItem value="clear">Clear stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {stockUpdates.operation !== 'clear' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        value={stockUpdates.value}
                        onChange={(e) => setStockUpdates(prev => ({ 
                          ...prev, 
                          value: e.target.value 
                        }))}
                        placeholder="0"
                        min="0"
                        step="1"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apply To
                    </label>
                    {/* <RadioGroup
                      value={stockUpdates.applyTo}
                      onValueChange={(value) => setStockUpdates(prev => ({ 
                        ...prev, 
                        applyTo: value as any 
                      }))}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="all" id="all-warehouses" />
                        <label htmlFor="all-warehouses" className="text-sm">All Warehouses</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="specific" id="specific-warehouse" />
                        <label htmlFor="specific-warehouse" className="text-sm">Specific Warehouse</label>
                      </div>
                    </RadioGroup> */}
                    
                    {stockUpdates.applyTo === 'specific' && (
                      <div className="mt-2">
                        <Select
                          value={stockUpdates.specificWarehouse}
                          onValueChange={(value) => setStockUpdates(prev => ({ 
                            ...prev, 
                            specificWarehouse: value 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__keep__">All Warehouses</SelectItem>
                            {warehouses.map((warehouse) => (
                              <SelectItem key={warehouse.value} value={warehouse.value}>
                                <div className="flex items-center gap-2">
                                  {/* <Warehouse className="h-3 w-3" /> */}
                                  {warehouse.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={stockUpdates.statusId}
                      onValueChange={(value) => setStockUpdates(prev => ({ 
                        ...prev, 
                        statusId: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keep Current">Keep Current</SelectItem>
                        {productStatus.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <Select
                      value={stockUpdates.conditionId}
                      onValueChange={(value) => setStockUpdates(prev => ({ 
                        ...prev, 
                        conditionId: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__keep__">Keep Current</SelectItem>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        value={stockUpdates.location}
                        onChange={(e) => setStockUpdates(prev => ({ 
                          ...prev, 
                          location: e.target.value 
                        }))}
                        placeholder="e.g., Aisle 3, Shelf B"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reorder Point
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Target className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        type="number"
                        value={stockUpdates.reorderPoint}
                        onChange={(e) => setStockUpdates(prev => ({ 
                          ...prev, 
                          reorderPoint: e.target.value 
                        }))}
                        placeholder="10"
                        min="0"
                        step="1"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  {mode === 'stock' && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleStockUpdate}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Apply Stock
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Editor */}
          {(mode === 'status' || mode === 'all') && (
            <div className="space-y-6 mb-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  Bulk Status Update
                </h4>
                <span className="text-sm text-gray-500">Applies to {selectedCount} variants</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Active Status
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setStatusUpdates(prev => ({ ...prev, isActive: true }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          statusUpdates.isActive
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Active
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusUpdates(prev => ({ ...prev, isActive: false }))}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          !statusUpdates.isActive
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Inactive
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Status
                    </label>
                    <Select
                      value={statusUpdates.productStatusId}
                      onValueChange={(value) => setStatusUpdates(prev => ({ 
                        ...prev, 
                        productStatusId: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__keep__">Keep Current</SelectItem>
                        {productStatus.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <Select
                      value={statusUpdates.conditionId}
                      onValueChange={(value) => setStatusUpdates(prev => ({ 
                        ...prev, 
                        conditionId: value 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__keep__--">Keep Current</SelectItem>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <Textarea
                      value={statusUpdates.notes}
                      onChange={(e) => setStatusUpdates(prev => ({ 
                        ...prev, 
                        notes: e.target.value 
                      }))}
                      placeholder="Add notes about this status change..."
                      rows={4}
                    />
                  </div>
                  
                  {mode === 'status' && (
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleStatusUpdate}
                        className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Apply Status
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All Mode - Combined Action */}
          {mode === 'all' && (
            <div className="pt-6 border-t border-gray-200">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800">Apply All Updates</p>
                    <p className="text-sm text-gray-600 mt-1">
                      This will apply pricing, stock, and status updates to all {selectedCount} selected variants.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  This is a bulk operation. Changes cannot be easily undone.
                </div>
                
                <button
                  type="button"
                  onClick={handleAllUpdates}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Apply All Updates
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Copy className="h-4 w-4 text-gray-600" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={handleActivateAll}
                className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-sm font-medium"
              >
                Activate All
              </button>
              
              <button
                type="button"
                onClick={handleDeactivateAll}
                className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Deactivate All
              </button>
              
              <button
                type="button"
                onClick={handleSetZeroStock}
                className="p-3 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-sm font-medium"
              >
                Set Stock to 0
              </button>
              
              <button
                type="button"
                onClick={handlePriceIncrease10}
                className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                +10% Price
              </button>
              
              <button
                type="button"
                onClick={handlePriceDecrease10}
                className="p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                -10% Price
              </button>
              
              <button
                type="button"
                onClick={() => onBulkUpdateStock({ quantity: 100 })}
                className="p-3 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors text-sm font-medium"
              >
                Set Stock to 100
              </button>
              
              <button
                type="button"
                onClick={() => onBulkUpdatePricing({ taxId: taxes[0]?.value })}
                className="p-3 bg-violet-50 text-violet-700 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors text-sm font-medium"
              >
                Apply Default Tax
              </button>
              
              <button
                type="button"
                onClick={() => onBulkUpdateStock({ location: 'Main Warehouse' })}
                className="p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors text-sm font-medium"
              >
                Set Location
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}