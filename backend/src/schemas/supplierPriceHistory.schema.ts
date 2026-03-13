// ─────────────────────────────────────────────────────────────────────────────
// FILE 1: src/schemas/supplierPriceHistory.schema.ts
// ─────────────────────────────────────────────────────────────────────────────
import { Schema } from "mongoose";
import { z }      from "zod";

export const SupplierPriceHistorySchema = new Schema(
  {
    // Kaunse product ka price hai
    productId:  { type: Schema.Types.ObjectId, ref: "Product",  required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    userId:     { type: Schema.Types.ObjectId, ref: "User",     required: true },
    sku:        { type: String, required: true },

    // Price data
    newPrice:      { type: Number, required: true },
    previousPrice: { type: Number, default: null }, // null = pehli entry
    currency:      { type: String, default: "GBP" },

    // Kyun aur kaise change hua
    source: {
      type:     String,
      enum:     ["manual", "po", "grn"],
      required: true,
    },
    changeReason: { type: String, default: "" },

    // Reference documents
    poNumber:  { type: String, default: null },
    grnNumber: { type: String, default: null },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

SupplierPriceHistorySchema.index({ productId: 1, supplierId: 1, createdAt: -1 });
SupplierPriceHistorySchema.index({ supplierId: 1, createdAt: -1 });

// Zod validation
export const manualPriceUpdateSchema = z.object({
  productId:    z.string().min(1, "Product required"),
  supplierId:   z.string().min(1, "Supplier required"),
  sku:          z.string().min(1, "SKU required"),
  newPrice:     z.coerce.number().min(0, "Price must be >= 0"),
  currency:     z.string().default("GBP"),
  changeReason: z.string().min(3, "Reason is required (min 3 chars)"),
});

export type ManualPriceUpdateInput = z.infer<typeof manualPriceUpdateSchema>;