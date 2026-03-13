// ProductListing.tsx - UPDATED VERSION
'use client'
import { useMemo } from 'react';
import { ProductStatistics } from './ProductStats';
import { CategoryFilters } from './CategoryFilters';
import { ProductCard } from './ProductCard';
import { CheckCircle, AlertCircle, Package } from "lucide-react"
import { Product,  ProductListItem } from '../types/product';
import { Button } from "@/components/form/CustomButton"
import { DatabaseCategory } from '../../../../../hooks/useCategory';

interface ProductListingProps {
  products: ProductListItem[];  
  hasActiveFilters: boolean;
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
 
  onResetFilters: () => void;
}

export const ProductListing = ({ 
  products,  
  hasActiveFilters,
  onViewProduct, 
  onEditProduct,
  onResetFilters,

}: ProductListingProps) => {



  console.log("products",products)

  const getStockBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: any }> = {
      'in-stock': { 
        class: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
        icon: CheckCircle
      },
      'low-stock': { 
        class: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        icon: AlertCircle
      },
      'out-of-stock': { 
        class: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
        icon: AlertCircle
      }
    };
    return variants[status] || variants['in-stock'];
  };

  return (
    <div className="space-y-6">
      

      {/* Product Grid */}
      {products?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onView={onViewProduct}
              onEdit={onEditProduct}
              getStockBadge={getStockBadge}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            {hasActiveFilters 
              ? 'Try adjusting your search or filter criteria' 
              : 'Start by adding your first product'}
          </p>
          {hasActiveFilters && (
            <Button
              onClick={onResetFilters}
              variant="outline"
              className="mt-4"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};