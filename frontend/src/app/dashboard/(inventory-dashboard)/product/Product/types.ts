// types.ts
export interface Supplier {
  _id: string;
  legalBusinessName: string;
  contactInformation?: {
    primaryContactName?: string;
    emailAddress?: string;
  };
}

export interface Category {
  _id: string;
  categoryName: string;
  level: number;
  parentId?: string;
  path?: string[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  level: number;
}

export interface Pricing {
  _id?: string;
  marketplaceName: string;
  marketplaceId?: string;
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  discountPercentage: number;
  taxId?: string;
  taxRate: number;
  vatExempt: boolean;
}

export interface Stock {
  stockQuantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  safetyStock?: number;
  leadTimeDays?: number;
  stockLocation?: string;
  warehouseId?: string;
  binLocation?: string;
  productStatusId?: string;
  conditionId?: string;
  supplierId?: string;
  stockStatus: string;
  featured: boolean;
  onHand: number;
  recordLevel?: number;
  reorderQuantity?: number;
  warehouseStatusId?: string;
}

export interface Warranty {
  warrantyType: string;
  warrantyPeriod: string;
}

export interface Attribute {
  _id?: string;
  sku: string;
  attributes: Record<string, any>; // Dynamic attributes by ID
  pricing: Pricing[];
  stock: Stock;
  warranty: Warranty;
  supplierId?: string;
}

export interface Product {
  _id: string;
  id: string;
  productName: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  brand?: string;
  manufacturer?: string;
  modelNumber?: string;
  barcode?: string;
  status: string;
  featured?: boolean;
  images?: string[];
  tags?: string[];
  keywords?: string[];
  price?: number;
  costPrice?: number;
  retailPrice?: number;
  stockQuantity?: number;
  stockStatus?: string;
  onHand?: number;
  reorderLevel?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  supplierId?: string;
  supplierName?: string;
  primaryCategory?: CategoryInfo;
  categories?: CategoryInfo[];
  attributes?: Attribute[];
  categoryId?: string;
  categoryPath?: string[];
}

// types.ts
export interface ProductFormData {
  _id: string;
  id: string;
  productName: string;
  sku: string;
  description: string;
  shortDescription: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  barcode: string;
  isActive: boolean;
  featured: boolean;
  images: string[];
  tags: string[];
  keywords: string[];
  
  // Supplier
  supplierId: string;
  supplierName: string;
  
  // Pricing
  price: number;
  costPrice: number;
  retailPrice: number;
  
  // Stock
  stockQuantity: number;
  stockStatus: string;
  onHand: number;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel: number;
  warehouseId?: string;
  warehouseStatusId?: string;
  productStatusId?: string;
  conditionId?: string;
  
  // Warranty
  warrantyType: string;
  warrantyPeriod: string;
  
  // Categories
  categoryId: string;
  categoryPath: string[];
  categories: CategoryInfo[];
  
  // Attributes (all variants)
  attributes: Attribute[];
}

// Allow nested paths with dot notation
export type NestedKeyOf<T> = {
  [K in keyof T]: T[K] extends object 
    ? `${string & K}.${string & keyof T[K]}` | `${string & K}.${string & keyof T[K]}.${string & keyof NonNullable<T[K][keyof T[K]]>}` 
    : K;
}[keyof T];


export interface ProductQuickEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (updatedProduct: any) => Promise<void>;
  onFullEdit?: () => void;
  suppliers?: Supplier[];
  categories?: Category[];
}