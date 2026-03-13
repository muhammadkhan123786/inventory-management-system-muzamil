

import { Schema, SchemaDefinition } from "mongoose";
import { commonSchema } from "./shared/common.schema";
import { z } from "zod";
import { commonSchemaValidation } from "./shared/common.schema";

// ─── 4. STOCK sub-document ────────────────────────────────────────────────
export const AttributeStockSchema = new Schema(
  {
    stockQuantity: { type: Number, required: true, min: 0 },
    minStockLevel: { type: Number, default: 0, min: 0 },
    maxStockLevel: { type: Number, default: 0, min: 0 },
    reorderPoint: { type: Number, default: 0, min: 0 },
    safetyStock: { type: Number, default: 0, min: 0 },
    leadTimeDays: { type: Number, default: 0, min: 0 },
    stockLocation: { type: String, default: "" },
    warehouseId: { type: Schema.Types.ObjectId, ref: "Warehouse" },
    binLocation: { type: String, default: "" },
    productStatusId: { type: Schema.Types.ObjectId, ref: "ProductStatus" },
    conditionId: { type: Schema.Types.ObjectId, ref: "Condition" },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    stockStatus: { type: String, default: "in-stock" },
    featured: { type: Boolean, default: false },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── STOCK Virtuals ────────────────────────────────────────────────
AttributeStockSchema.virtual("onHand").get(function () {
  return this.stockQuantity;
});
AttributeStockSchema.virtual("recordLevel").get(function () {
  return this.reorderPoint;
});
AttributeStockSchema.virtual("reorderQuantity").get(function () {
  const stock = this.stockQuantity || 0;
  const max = this.maxStockLevel || 0;
  return stock <= (this.reorderPoint || 0) ? max - stock : 0;
});

// ─── 5. WARRANTY sub-document ─────────────────────────────────────────────
export const AttributeWarrantySchema = new Schema(
  {
    warrantyType: { type: String, required: true },
    warrantyPeriod: { type: String, required: true },
  },
  { _id: false }
);

// ─── 3. PRICING sub-document ──────────────────────────────────────────────
export const AttributePricingSchema = new Schema(
  {

    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    retailPrice: { type: Number, default: 0, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    taxId: { type: Schema.Types.ObjectId, ref: "Tax" },
    taxRate: { type: Number, default: 0 },
    vatExempt: { type: Boolean, default: false },
  },
  { _id: true }
);

// ─── 2. PRODUCT ATTRIBUTE (variant) ──────────────────────────────────────
export const ProductAttributeSchema = new Schema(
  {
    sku: { type: String, required: true },
    attributes: { type: Schema.Types.Mixed, required: true },
    pricing: [AttributePricingSchema],
    stock: AttributeStockSchema,
    warranty: AttributeWarrantySchema,
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── 1. PRODUCT (top-level) ─────────────────────────────────────────────
export const ProductSchema: SchemaDefinition = {
  ...commonSchema,

  productName: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String, default: "" },
  brand: { type: String, default: "" },
  manufacturer: { type: String, default: "" },
  modelNumber: { type: String, default: "" },
  description: { type: String, required: true },
  shortDescription: { type: String, default: "" },
  keywords: [{ type: String }],
  tags: [{ type: String }],
  images: [{ type: String }],
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  categoryPath: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  attributes: [ProductAttributeSchema],
};



// ─── Zod Validation ──────────────────────────────────────────────────────
export const attributeWarrantyValidation = z.object({
  warrantyType: z.string(),
  warrantyPeriod: z.string().min(1),
});

export const attributeStockValidation = z.object({
  stockQuantity: z.coerce.number().min(0),
  minStockLevel: z.coerce.number().min(0).default(0),
  maxStockLevel: z.coerce.number().min(0).default(0),
  reorderPoint: z.coerce.number().min(0).default(0),
  safetyStock: z.coerce.number().min(0).default(0),
  leadTimeDays: z.coerce.number().min(0).default(0),
  stockLocation: z.string().default(""),
  warehouseId: z.string().optional().nullable(),
  binLocation: z.string().default(""),
  productStatusId: z.string().optional().nullable(),
  supplierId: z.string(),
  conditionId: z.string().optional().nullable(),
  stockStatus: z.string().default("in-stock"),
  featured: z.boolean().default(false),
});
export const attributePricingValidation = z
  .object({
    costPrice: z.coerce.number().min(0),
    sellingPrice: z.coerce.number().min(0),
    retailPrice: z.coerce.number().min(0).default(0),
    discountPercentage: z.coerce.number().min(0).max(100).default(0),
    taxId: z.string().optional().nullable(),
    taxRate: z.coerce.number().min(0).default(0),
    vatExempt: z.boolean().default(false),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: "Selling price must be >= cost price",
    path: ["sellingPrice"],
  });
export const productAttributeValidation = z.object({
  sku: z.string().min(1),
  attributes: z.record(z.string(), z.any()),
  pricing: z.array(attributePricingValidation).min(1),
  stock: attributeStockValidation,
  warranty: attributeWarrantyValidation,
});
export const createProductValidation = z.object({
  ...commonSchemaValidation,
  productName: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().default(""),
  brand: z.string().default(""),
  manufacturer: z.string().default(""),
  modelNumber: z.string().default(""),
  description: z.string().min(1),
  shortDescription: z.string().default(""),
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  categoryId: z.string().min(1),
  categoryPath: z.array(z.string()).min(1),
  attributes: z.array(productAttributeValidation).min(1),
});

// ─── TypeScript Inferred Types ──────────────────────────────────────────
export type CreateProductInput = z.infer<typeof createProductValidation>;
export type ProductAttributeInput = z.infer<typeof productAttributeValidation>;
export type AttributePricingInput = z.infer<typeof attributePricingValidation>;
export type AttributeStockInput = z.infer<typeof attributeStockValidation>;
export type AttributeWarrantyInput = z.infer<typeof attributeWarrantyValidation>;
