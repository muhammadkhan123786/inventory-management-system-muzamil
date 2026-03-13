// components/variants/VariantManager.tsx
"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckSquare, 
  Square,
  Filter,
  Search,
  MoreVertical,
  Download,
  Upload,
  BarChart3,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { Input } from '@/components/form/Input';
import { Switch } from '@/components/form/Switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";

interface VariantManagerProps {
  variants: Array<{
    id: string;
    sku: string;
    attributes: Record<string, any>;
    pricing: Array<{ marketplaceId: string; price: number }>;
    stock: Array<{ warehouseId: string; quantity: number }>;
    isActive: boolean;
  }>;
  attributes: Array<{
    _id: string;
    attributeName: string;
    values?: Array<{ id: string; value: string; label?: string }>;
  }>;
  bulkEditMode?: boolean;
  selectedVariants?: string[];
  onSelectVariant?: (variantId: string) => void;
  onSelectAll?: () => void;
  onEditVariant: (variant: any) => void;
  onDeleteVariant: (variantId: string) => void;
  onToggleActive?: (variantId: string, isActive: boolean) => void;
  onDuplicateVariant?: (variant: any) => void;
}

export function VariantManager({
  variants,
  attributes,
  bulkEditMode = false,
  selectedVariants = [],
  onSelectVariant = () => {},
  onSelectAll = () => {},
  onEditVariant,
  onDeleteVariant,
  onToggleActive = () => {},
  onDuplicateVariant = () => {}
}: VariantManagerProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'sku' | 'price' | 'stock' | 'status'>('sku');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedVariants, setExpandedVariants] = useState<string[]>([]);
  const [filterActive, setFilterActive] = useState<string>('all'); // 'all', 'active', 'inactive'
  const [selectedAttributeFilter, setSelectedAttributeFilter] = useState<string>('all');

  // Get attribute label for display
  const getAttributeLabel = (attributeId: string, value: any) => {
    const attribute = attributes.find(attr => attr._id === attributeId);
    if (!attribute) return value;
    
    const option = attribute.values?.find(val => 
      val.id === value || val.value === value
    );
    return option?.label || option?.value || value;
  };

  // Filter and sort variants
  const filteredAndSortedVariants = useMemo(() => {
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

    // Apply status filter
    if (filterActive === 'active') {
      filtered = filtered.filter(v => v.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(v => !v.isActive);
    }

    // Apply attribute filter
    if (selectedAttributeFilter !== 'all') {
      filtered = filtered.filter(v => 
        Object.keys(v.attributes).includes(selectedAttributeFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'sku':
          aValue = a.sku;
          bValue = b.sku;
          break;
        case 'price':
          aValue = a.pricing[0]?.price || 0;
          bValue = b.pricing[0]?.price || 0;
          break;
        case 'stock':
          aValue = a.stock.reduce((sum, s) => sum + s.quantity, 0);
          bValue = b.stock.reduce((sum, s) => sum + s.quantity, 0);
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a.sku;
          bValue = b.sku;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [variants, searchQuery, filterActive, selectedAttributeFilter, sortBy, sortOrder]);

  // Calculate total stock for a variant
  const getTotalStock = (variant: any) => {
    return variant.stock.reduce((sum: number, s: any) => sum + s.quantity, 0);
  };

  // Get average price for a variant
  const getAveragePrice = (variant: any) => {
    if (variant.pricing.length === 0) return 0;
    const sum = variant.pricing.reduce((total: number, p: any) => total + p.price, 0);
    return sum / variant.pricing.length;
  };

  // Toggle variant expansion
  const toggleExpanded = (variantId: string) => {
    setExpandedVariants(prev =>
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  // Handle duplicate variant
  const handleDuplicate = (variant: any) => {
    const duplicatedVariant = {
      ...variant,
      id: `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku: `${variant.sku}-COPY-${Date.now().toString(36).toUpperCase().slice(0, 4)}`,
      isActive: false
    };
    onDuplicateVariant(duplicatedVariant);
  };

  // Export variants to CSV
  const handleExport = () => {
    const csvData = [
      ['SKU', 'Status', ...attributes.map(a => a.attributeName), 'Price', 'Stock'].join(','),
      ...filteredAndSortedVariants.map(v => [
        v.sku,
        v.isActive ? 'Active' : 'Inactive',
        ...attributes.map(a => v.attributes[a._id] || ''),
        getAveragePrice(v).toFixed(2),
        getTotalStock(v)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variants-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Quick stats
  const stats = useMemo(() => {
    const totalVariants = filteredAndSortedVariants.length;
    const activeVariants = filteredAndSortedVariants.filter(v => v.isActive).length;
    const totalStock = filteredAndSortedVariants.reduce((sum, v) => sum + getTotalStock(v), 0);
    const totalValue = filteredAndSortedVariants.reduce((sum, v) => 
      sum + (getAveragePrice(v) * getTotalStock(v)), 0
    );

    return { totalVariants, activeVariants, totalStock, totalValue };
  }, [filteredAndSortedVariants]);

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-6">
        {/* Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Grid className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Variant Manager</h3>
              <p className="text-sm text-gray-600">
                Manage {variants.length} product variant{variants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* Bulk Select All */}
            {bulkEditMode && (
              <button
                onClick={onSelectAll}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
              >
                {selectedVariants.length === variants.length ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    Select All
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row items-center gap-4">
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

            {/* Status Filter */}
            <Select
              value={filterActive}
              onValueChange={setFilterActive}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Attribute Filter */}
            <Select
              value={selectedAttributeFilter}
              onValueChange={setSelectedAttributeFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by attribute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Attributes</SelectItem>
                {attributes.map(attr => (
                  <SelectItem key={attr._id} value={attr._id}>
                    {attr.attributeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={sortBy}
              // onValueChange={setSortBy}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sku">SKU</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Stats Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded border border-gray-200">
              <div className="text-sm text-gray-600">Showing</div>
              <div className="text-lg font-bold text-gray-800">{stats.totalVariants}</div>
            </div>
            <div className="p-3 bg-white rounded border border-gray-200">
              <div className="text-sm text-gray-600">Active</div>
              <div className="text-lg font-bold text-green-600">{stats.activeVariants}</div>
            </div>
            <div className="p-3 bg-white rounded border border-gray-200">
              <div className="text-sm text-gray-600">Total Stock</div>
              <div className="text-lg font-bold text-blue-600">{stats.totalStock}</div>
            </div>
            <div className="p-3 bg-white rounded border border-gray-200">
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="text-lg font-bold text-purple-600">${stats.totalValue.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Variants List/Grid */}
        {filteredAndSortedVariants.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <div className="inline-block mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">No variants found</h4>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Create your first variant to get started'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-3">
            {filteredAndSortedVariants.map((variant) => {
              const isSelected = selectedVariants.includes(variant.id);
              const isExpanded = expandedVariants.includes(variant.id);
              const totalStock = getTotalStock(variant);
              const avgPrice = getAveragePrice(variant);

              return (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Variant Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Bulk Selection Checkbox */}
                        {bulkEditMode && (
                          <button
                            onClick={() => onSelectVariant(variant.id)}
                            className={`h-5 w-5 rounded border flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="h-2 w-2 bg-white rounded-sm"></div>
                            )}
                          </button>
                        )}

                        {/* SKU and Status */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-800">
                            {variant.sku}
                          </span>
                          <Badge className={
                            variant.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }>
                            {variant.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Stock and Price */}
                        <div className="text-right">
                          <div className="font-bold text-gray-800">${avgPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">{totalStock} in stock</div>
                        </div>

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleExpanded(variant.id)}
                          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {/* Action Menu */}
                        <div className="relative">
                          <button className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {/* Dropdown menu would go here */}
                        </div>
                      </div>
                    </div>

                    {/* Attributes Summary */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(variant.attributes).map(([attrId, value]) => {
                        const attribute = attributes.find(a => a._id === attrId);
                        if (!attribute) return null;
                        
                        return (
                          <Badge key={attrId} className="bg-gray-100 text-gray-700">
                            {attribute.attributeName}: {getAttributeLabel(attrId, value)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 border-t border-gray-200"
                    >
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pricing Details */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Pricing</h5>
                          <div className="space-y-2">
                            {variant.pricing.map((price, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{price.marketplaceId}</span>
                                <span className="font-medium">${price.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Stock Details */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Stock</h5>
                          <div className="space-y-2">
                            {variant.stock.map((stock, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Warehouse {idx + 1}</span>
                                <span className="font-medium">{stock.quantity} units</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => onEditVariant(variant)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(variant)}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => onToggleActive(variant.id, !variant.isActive)}
                          className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
                        >
                          {variant.isActive ? (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this variant?')) {
                              onDeleteVariant(variant.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedVariants.map((variant) => {
              const isSelected = selectedVariants.includes(variant.id);
              const totalStock = getTotalStock(variant);
              const avgPrice = getAveragePrice(variant);

              return (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white rounded-lg border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Bulk Selection */}
                  {bulkEditMode && (
                    <div className="mb-3">
                      <button
                        onClick={() => onSelectVariant(variant.id)}
                        className={`h-5 w-5 rounded border flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 bg-white rounded-sm"></div>
                        )}
                      </button>
                    </div>
                  )}

                  {/* SKU and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-gray-800 text-sm">
                      {variant.sku}
                    </span>
                    <Badge className={
                      variant.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Attributes */}
                  <div className="mb-3">
                    {Object.entries(variant.attributes).map(([attrId, value]) => {
                      const attribute = attributes.find(a => a._id === attrId);
                      if (!attribute) return null;
                      
                      return (
                        <div key={attrId} className="text-sm mb-1">
                          <span className="text-gray-600">{attribute.attributeName}: </span>
                          <span className="font-medium">{getAttributeLabel(attrId, value)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-3 pt-3 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-600">Price</div>
                      <div className="font-bold text-gray-800">${avgPrice.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Stock</div>
                      <div className="font-bold text-gray-800">{totalStock}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditVariant(variant)}
                      className="flex-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => onToggleActive(variant.id, !variant.isActive)}
                      className="px-2 py-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-xs"
                    >
                      {variant.isActive ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this variant?')) {
                          onDeleteVariant(variant.id);
                        }
                      }}
                      className="px-2 py-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination (if needed) */}
        {filteredAndSortedVariants.length > 20 && (
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing 1-20 of {filteredAndSortedVariants.length} variants
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
                Previous
              </button>
              <button className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                1
              </button>
              <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
                2
              </button>
              <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
                Next
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}