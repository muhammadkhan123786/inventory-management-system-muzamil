import { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  count: number;
  color: string;
  subcategories?: Category[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  weight: string;
  manufacturer: string;
  warranty: string;
  rating: number;
  totalReviews: number;
  imageUrl?: string;
  featured: boolean;
  status: 'active' | 'inactive' | 'discontinued';
  reorderLevel: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface FilterOptions {
  searchTerm: string;
  selectedCategory: string;
  selectedSubcategory: string;
  statusFilter: string;
  stockFilter: string;
}