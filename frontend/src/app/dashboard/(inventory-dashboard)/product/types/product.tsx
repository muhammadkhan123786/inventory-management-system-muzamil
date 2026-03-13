// types/product.ts

/**
 * Category information for a single category level
 */
export interface CategoryInfo {
  id: string;
  name: string;
  level: number;
  parentId: string;
  lenght?: any; // typo maybe?
}

interface Category {
  id: string;
  name: string;
  level: number;
  parentId: string;
}

/**
 * Base Product interface (used in listings, cards, tables)
 */
export interface ProductListItem {
  id: string;
  productName: string;
  _id: string;
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  barcode: string;
  
  // Categories - dynamic array for n-th level support
  categories: any;
  categoryPath: any;
  primaryCategory: CategoryInfo;
  
  // Pricing
  price: number;
  costPrice: number;
  retailPrice: number;
  
  // Stock
  stockQuantity: number;
  stockStatus: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  reorderQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  
  // Media
  imageUrl: string;
  images: string[];
  
  // Status
  featured: boolean;
  status: string;
  
  // Additional info
  warranty: string;
  tags: string[];
  keywords: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Optional fields for UI
  rating?: number;
  totalReviews?: number;
  dimensions?: string;
  weight?: string;
  attributes?: any;
}

/**
 * Detailed Product interface (used in product details, edit forms)
 */
export interface Product extends ProductListItem {
  attributes: ProductAttribute[];
}

/**
 * API Product Response (from backend)
 */
export interface ApiProduct {
  _id: string;
  productName: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  barcode: string;
  isActive: boolean;
  isDeleted: boolean;
  images: string[];
  categoryId: string | { 
    _id: string; 
    categoryName?: string; 
    name?: string; 
    level?: number; 
    parentId?: string 
  };
  categoryPath: (string | { 
    _id: string; 
    categoryName?: string; 
    name?: string; 
    level?: number; 
    parentId?: string 
  })[];
  attributes: ProductAttribute[];
  ui_price: number;
  ui_totalStock: number;
  tags?: string[];
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Product Filter Options
 */
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categoryLevel?: number;
  status?: string;
  featured?: boolean;
  stockStatus?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  manufacturer?: string;
  [key: string]: any;
}

/**
 * Product Statistics
 */
export interface ProductStatistics {
  total: number;
  activeCount: number;
  inactiveCount: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  featuredCount: number;
}

/**
 * Pagination Info
 */
export interface PaginationInfo {
  total: number;
  activeCount: number;
  inactiveCount: number;
  page: number;
  limit: number;
  totalPages?: number;
}


// types/marketplace.types.ts
export interface MarketplacePrice {
  marketplaceName: string;
  marketplaceId: string;
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  discountPercentage: number;
  taxId: string;
  taxRate: number;
  vatExempt: boolean;
  _id: string;
  id: string;
}

export interface ProductAttribute {
  sku: string;
  attributes: Record<string, string>;
  pricing: MarketplacePrice[];
  stock: {
    stockQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    reorderPoint: number;
    safetyStock: number;
    leadTimeDays: number;
    stockLocation: string;
    warehouseId: string;
    binLocation: string;
    productStatusId: string;
    conditionId: string;
    supplierId: string;
    stockStatus: string;
    featured: boolean;
    onHand: number;
    recordLevel: number;
    reorderQuantity: number;
  };
  warranty: {
    warrantyType: string;
    warrantyPeriod: string;
  };
  _id: string;
  id: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  barcode: string;
  categories: Category[];
  categoryPath: Category[];
  primaryCategory: Category;
  price: number;
  costPrice: number;
  retailPrice: number;
  stockQuantity: number;
  stockStatus: string;
  warranty: string;
  imageUrl: string;
  images: string[];
  featured: boolean;
  status: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  reorderQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  tags: string[];
  keywords: string[];
  attributes: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}



export interface Marketplace {
  id: string;
  name: string;
  displayName: string;  // Capitalized name for display
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface Marketplace {
  id: string;           // Marketplace ki ID jo product mein hogi
  name: string;
   displayName: string;
  key: string;          // eBay, amazon, etc.
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface ProductMarketplacePrice {
  marketplaceId: string;
  price: number;
  quantity: number;
  status?: string;
}






