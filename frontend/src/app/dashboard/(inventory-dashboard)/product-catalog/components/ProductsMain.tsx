'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/form/Card';
import { Button } from '@/components/form/CustomButton';
import { Package, Plus } from 'lucide-react';
import { ProductStat } from './ProductStats';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductFilters } from './ProductFilters';
import { ProductGrid } from './ProductGrid';
import { ViewDialog, EditDialog, DeleteDialog } from './ProductDialogs';
import { useProducts } from '../hooks/useProducts';
import { useProductDialogs } from '../hooks/useProductDialogs';
import { categories } from '../data/categories';

export default function EnhancedProducts() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const {
    products,
    filteredProducts,
    stats,
    filters,
    updateFilter,
    resetFilters,
    updateProduct,
    deleteProduct
  } = useProducts();

  const {
    selectedProduct,
    showViewDialog,
    showEditDialog,
    showDeleteDialog,
    editFormData,
    setEditFormData,
    openViewDialog,
    openEditDialog,
    openDeleteDialog,
    closeAllDialogs
  } = useProductDialogs();

  const handleSaveEdit = () => {
    if (editFormData.id) {
      updateProduct(editFormData.id, editFormData);
      toast.success('Product updated successfully');
      closeAllDialogs();
    }
  };

  const handleDelete = () => {
    if (selectedProduct) {
      deleteProduct(selectedProduct.id);
      toast.success('Product deleted successfully');
      closeAllDialogs();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
              <Package className="h-10 w-10 text-indigo-600" />
              Product Catalog
            </h1>
            <p className="text-gray-600 mt-2">Browse and manage all products by category</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/add-product')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </motion.div>

        {/* Stats */}
        <ProductStat stats={stats} />

        {/* Category Navigation */}
        <CategoryNavigation
          categories={categories}
          selectedCategory={filters.selectedCategory}
          selectedSubcategory={filters.selectedSubcategory}
          onCategorySelect={(category) => updateFilter('selectedCategory', category)}
          onSubcategorySelect={(subcategory) => updateFilter('selectedSubcategory', subcategory)}
        />

        {/* Search and Filters */}
        <ProductFilters
          searchTerm={filters.searchTerm}
          statusFilter={filters.statusFilter}
          stockFilter={filters.stockFilter}
          viewMode={viewMode}
          filteredCount={filteredProducts.length}
          totalCount={products.length}
          onSearchChange={(value) => updateFilter('searchTerm', value)}
          onStatusFilterChange={(value) => updateFilter('statusFilter', value)}
          onStockFilterChange={(value) => updateFilter('stockFilter', value)}
          onViewModeChange={setViewMode}
        />

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          viewMode={viewMode}
          onView={openViewDialog}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <Button onClick={resetFilters} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <ViewDialog
          product={selectedProduct}
          open={showViewDialog}
          onOpenChange={(open) => !open && closeAllDialogs()}
        />

        <EditDialog
          product={selectedProduct}
          open={showEditDialog}
          formData={editFormData}
          onOpenChange={(open) => !open && closeAllDialogs()}
          onFormDataChange={setEditFormData}
          onSave={handleSaveEdit}
        />

        <DeleteDialog
          product={selectedProduct}
          open={showDeleteDialog}
          onOpenChange={(open) => !open && closeAllDialogs()}
          onConfirm={handleDelete}
        />
      </div>
    </div>
  );
}