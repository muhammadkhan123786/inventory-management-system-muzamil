"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/form/Card";
import { Input } from "@/components/form/Input";
import { Button } from "@/components/form/CustomButton";
import {
  Search,
  X,
  ChevronDown,
  Filter,
  Star,
} from "lucide-react";

interface CategoryFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: string;
  selectedStockStatus: string;
  showFeaturedOnly: boolean;
  categories?: Array<{
    _id: string;
    categoryName: string;
    parentId?: string | null;
    children?: any[];
    [key: string]: any;
  }>;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onStockStatusChange: (value: string) => void;
  onFeaturedToggle: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  filterStats?: {
    total: number;
    filtered: number;
  };
}

interface FlatCategory {
  id: string;
  name: string;
  isParent: boolean;
  depth: number;
}

export const CategoryFilters = ({
  searchTerm,
  selectedCategory,
  selectedStatus,
  selectedStockStatus,
  showFeaturedOnly,
  categories = [],
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onStockStatusChange,
  onFeaturedToggle,
  onResetFilters,
  hasActiveFilters,
  filterStats,
}: CategoryFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build category tree
  const categoryTree = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    const hasPrebuiltChildren = categories.some(c => c.children && Array.isArray(c.children) && c.children.length > 0);
    
    if (hasPrebuiltChildren) {
      const roots = categories.filter(c => !c.parentId).map(c => ({
        ...c,
        id: c._id,
        name: c.categoryName,
        children: c.children || []
      }));
      
      const processNode = (node: any): any => {
        const processed = {
          ...node,
          id: node._id || node.id,
          name: node.categoryName || node.name,
          children: []
        };
        
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          processed.children = node.children.map(processNode);
        }
        
        return processed;
      };
      
      return roots.map(processNode);
    }
    
    const categoryMap = new Map<string, any>();
    const roots: any[] = [];

    categories.forEach((category) => {
      if (category && category._id) {
        categoryMap.set(category._id, {
          ...category,
          id: category._id,
          name: category.categoryName,
          children: [],
        });
      }
    });

    categories.forEach((category) => {
      if (!category || !category._id) return;
      const node = categoryMap.get(category._id);
      if (!node) return;

      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        if (parent) parent.children.push(node);
      } else if (!category.parentId) {
        roots.push(node);
      }
    });

    return roots;
  }, [categories]);

  // Flatten all categories for simple display
  const flatCategories = useMemo(() => {
    const flatten = (nodes: any[], parentDepth: number = -1): FlatCategory[] => {
      const result: FlatCategory[] = [];
      
      nodes.forEach((node) => {
        const nodeId = node._id || node.id;
        const hasChildren = node.children && node.children.length > 0;
        
        // Only top-level categories (parentDepth === -1) are parents
        result.push({
          id: nodeId,
          name: node.name,
          isParent: parentDepth === -1, // Only first level is bold
          depth: 0, // All in straight line
        });
        
        if (hasChildren) {
          result.push(...flatten(node.children, parentDepth + 1));
        }
      });
      
      return result;
    };
    
    return flatten(categoryTree);
  }, [categoryTree]);

  // Get selected category name
  const selectedCategoryName = useMemo(() => {
    if (selectedCategory === "all") return "All Categories";
    const category = flatCategories.find(c => c.id === selectedCategory);
    return category ? category.name : "Select Category";
  }, [selectedCategory, flatCategories]);

  // Filter categories based on main search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return flatCategories;
    const searchLower = searchTerm.toLowerCase();
    return flatCategories.filter(cat => cat.name.toLowerCase().includes(searchLower));
  }, [flatCategories, searchTerm]);

  const handleSelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            {filterStats && (
              <span className="text-sm text-gray-500">
                ({filterStats.filtered} of {filterStats.total})
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs text-red-600 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Product Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-3 h-10 text-sm"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Dropdown */}
          <div className="relative sm:col-span-2 lg:col-span-1" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-3 py-2.5 text-sm text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all flex items-center justify-between"
            >
              <span className="truncate text-gray-700">{selectedCategoryName}</span>
              <ChevronDown className={`h-4 w-4 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                >
                  {/* Categories List */}
                  <div className="max-h-64 overflow-y-auto p-1">
                    {/* All Categories */}
                    <div
                      onClick={() => handleSelect("all")}
                      className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                        selectedCategory === "all"
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-sm font-bold">All Categories</span>
                    </div>

                    {/* Category Items */}
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => handleSelect(category.id)}
                          className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                            selectedCategory === category.id
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span className={`text-sm ${category.isParent ? "font-bold" : "font-normal"}`}>
                            {category.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-6 text-center text-sm text-gray-500">
                        No categories found
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <select
              value={selectedStockStatus}
              onChange={(e) => onStockStatusChange(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={onFeaturedToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative"></div>
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Star className="h-4 w-4" /> Featured
              </span>
            </label>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                <Search className="h-3 w-3" />
                {searchTerm}
                <button onClick={() => onSearchChange("")} className="hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                {selectedCategoryName}
                <button onClick={() => onCategoryChange("all")} className="hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedStatus !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                {selectedStatus}
                <button onClick={() => onStatusChange("all")} className="hover:text-green-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedStockStatus !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-medium">
                {selectedStockStatus}
                <button onClick={() => onStockStatusChange("all")} className="hover:text-amber-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {showFeaturedOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                <Star className="h-3 w-3" />
                Featured
                <button onClick={onFeaturedToggle} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};