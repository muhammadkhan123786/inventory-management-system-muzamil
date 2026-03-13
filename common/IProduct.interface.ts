// export type ProductCondition = 'new' | 'refurbished' | 'used' | 'damaged';
// export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'out-of-stock';

// export interface IProduct {
//   // Identification
//   productName: string;
//   sku: string;
//   barcode?: string;
//   brand?: string;
//   manufacturer?: string;
//   modelNumber?: string;
  
//   // Categorization & Relations (Storing IDs)
//   categoryPath: string[]; // Array of Category IDs
//   finalCategoryId: string; 
//   warehouseId?: string; 
//   taxRateId?: string;
  
//   // Content
//   description: string;
//   shortDescription?: string;
//   keywords: string[];
//   tags: string[];
//   images: string[];
  
//   // Pricing (Stored as numbers for calculation)
//   costPrice: number;
//   sellingPrice: number;
//   retailPrice?: number;
//   discountPercentage?: number;
//   vatExempt: boolean;
  
//   // Inventory
//   stockQuantity: number;
//   minStockLevel: number;
//   maxStockLevel: number;
//   reorderPoint?: number;
//   stockLocation?: string;
//   binLocation?: string;
  
//   // Specifications
//   dimensions: {
//     weight?: number;
//     length?: number;
//     width?: number;
//     height?: number;
//   };
//   color?: string;
//   material?: string;
  
//   // Dynamic Data (Attributes)
//   dynamicFields: Record<string, any>;
  
//   // Status & SEO
//   condition: ProductCondition;
//   status: ProductStatus;
//   featured: boolean;
//   seo: {
//     metaTitle?: string;
//     metaDescription?: string;
//     metaKeywords?: string;
//   };
// }




/**
 * product.interface.ts
 *
 * Single shared interface file — import on BOTH frontend and backend.
 * Every Mongoose schema, every Zod schema, every modal, every API
 * payload is typed from exactly these interfaces.
 *
 * Hierarchy:
 *   IProduct
 *     └── IProductAttribute        (references productId)
 *           ├── IAttributePricing   (references attributeId)
 *           ├── IAttributeStock     (references attributeId)
 *           └── IAttributeWarranty  (references attributeId)
 */

// ─── 1. PRODUCT (top-level) ─────────────────────────────────────────────────

export interface IProduct {
  _id?: string;
  productName: string;
  sku: string;
  barcode: string;
  brand: string;
  manufacturer: string;
  modelNumber: string;
  description: string;
  shortDescription: string;
  keywords: string[];
  tags: string[];
  images: string[];
  categoryId: string;
  categoryPath: string[];
  dynamicFields?: Record<string, any>;
  createdAt?: Date | string;
  updatedAt?: Date | string;
   attributes: IEmbeddedProductAttribute[];
}

// ─── 2. PRODUCT ATTRIBUTE (one per variant, belongs to a product) ───────────

export interface IEmbeddedProductAttribute {
  _id?: string;
  productId?: string; // → ref Product._id
  sku: string; // variant-level SKU (e.g. PROD-RED-LG-001)
  attributes: Record<string, any>; 
   pricing: IAttributePricing[];
   stock: IAttributeStock; 
   warranty: IAttributeWarranty; 
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ─── 3. ATTRIBUTE PRICING (one per marketplace, belongs to an attribute) ────

export interface IAttributePricing {
  _id?: string;
  attributeId: string; // → ref ProductAttribute._id
  marketplaceId: string;
  marketplaceName: string;
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  discountPercentage: number;
  taxId: string;
  taxRate: number;
  vatExempt: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ─── 4. ATTRIBUTE STOCK (one per attribute, shared across marketplaces) ─────

export interface IAttributeStock {
  _id?: string;
  attributeId: string; // → ref ProductAttribute._id
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
  warehouseStatusId: string;
  featured: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ─── 5. ATTRIBUTE WARRANTY (one per attribute) ──────────────────────────────

export interface IAttributeWarranty {
  _id?: string;
  attributeId: string; // → ref ProductAttribute._id
  warrantyType: string; // manufacturer | seller | no_warranty | extended | lifetime
  warrantyPeriod: string; // e.g. "12 months", "2 years"
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ─── COMPOSITE: full product payload (what handleSubmit assembles) ──────────
// Used in transformDataForAPI and in the generic POST body.

export interface ICreateProductPayload {
  product: Omit<IProduct, "_id" | "createdAt" | "updatedAt">;
  attributes: Array<{
    attribute: Omit<IEmbeddedProductAttribute, "_id" | "productId" | "createdAt" | "updatedAt">;
    pricing: Array<Omit<IAttributePricing, "_id" | "attributeId" | "createdAt" | "updatedAt">>;
    stock: Omit<IAttributeStock, "_id" | "attributeId" | "createdAt" | "updatedAt">;
    warranty: Omit<IAttributeWarranty, "_id" | "attributeId" | "createdAt" | "updatedAt">;
  }>;
}

// ─── MODAL STEP ENUM (drives the generic modal manager) ─────────────────────

export enum ProductModalStep {
  PRODUCT = "product",
  ATTRIBUTES = "attributes",
  PRICING = "pricing",
  STOCK = "stock",
}