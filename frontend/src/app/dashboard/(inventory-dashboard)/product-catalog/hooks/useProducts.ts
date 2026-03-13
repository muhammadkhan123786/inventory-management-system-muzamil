import { useState, useMemo } from 'react';
import { Product, ProductStats, FilterOptions } from '../types/products';
import { mockProducts } from '../data/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    selectedCategory: 'all',
    selectedSubcategory: 'all',
    statusFilter: 'all',
    stockFilter: 'all'
  });

  // Calculate statistics
  const stats: ProductStats = useMemo(() => ({
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stockStatus === 'low-stock').length,
    outOfStock: products.filter(p => p.stockStatus === 'out-of-stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  }), [products]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesCategory = filters.selectedCategory === 'all' || product.category === filters.selectedCategory;
      const matchesSubcategory = filters.selectedSubcategory === 'all' || product.subcategory === filters.selectedSubcategory;
      const matchesStatus = filters.statusFilter === 'all' || product.status === filters.statusFilter;
      const matchesStock = filters.stockFilter === 'all' || product.stockStatus === filters.stockFilter;
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus && matchesStock;
    });
  }, [products, filters]);

  // Update filters
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCategory: 'all',
      selectedSubcategory: 'all',
      statusFilter: 'all',
      stockFilter: 'all'
    });
  };

  // Product CRUD operations
  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    setProducts(prev => 
      prev.map(p => p.id === id ? { ...p, ...updatedData } : p)
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    filteredProducts,
    stats,
    filters,
    updateFilter,
    resetFilters,
    addProduct,
    updateProduct,
    deleteProduct
  };
};