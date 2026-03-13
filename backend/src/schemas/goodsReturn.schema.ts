// schemas/goodsReturn.schema.ts
import { Schema } from "mongoose";
import { z } from "zod";
import { commonSchema, commonSchemaValidation } from "./shared/common.schema";
import { generateNextDocumentNumber } from "../services/documentNumber.service";

// ─────────────────────────────────────────────────────────────────────────────
// Item sub-schema — FIXED: added productId + sku so stock can be traced back
// ─────────────────────────────────────────────────────────────────────────────
export const GoodsReturnItemSchema = new Schema(
  {
    // ✅ Added — required to trace which product/variant stock to reverse
    productId: {
      type:     Schema.Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    sku: {
      type:     String,
      required: true,
    },
    productName: { type: String, default: "" },

    returnQty: {
      type:     Number,
      required: true,
      min:      1,
    },
    totalAmount: {
      type:     Number,
      required: true,
      min:      0,
    },
    unitPrice: { type: Number, default: 0 },

    status: {
      type:    String,
      enum:    ["pending", "approved", "in-transit", "completed", "rejected"],
      default: "pending",
    },
    itemsNotes: { type: String, default: "" },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Main schema
// ─────────────────────────────────────────────────────────────────────────────
export const GoodsReturnSchema = new Schema(
  {
    ...commonSchema,
    grtnNumber:      { type: String },
    returnReference: { type: String },

    // Link to GRN — so we can trace the original receipt
    grnId: {
      type:     Schema.Types.ObjectId,
      ref:      "grn",
      required: true,
    },

    returnedBy:   { type: String, required: true },
    returnReason: { type: String, required: true },
    returnDate:   { type: Date, default: Date.now },

    items: [GoodsReturnItemSchema],
    notes: { type: String, default: "" },

    status: {
      type:    String,
      enum:    ["pending", "approved", "in-transit", "completed", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

GoodsReturnSchema.pre("save", async function (this: any) {
  if (this.isNew) {
    if (!this.grtnNumber) {
      this.grtnNumber = await generateNextDocumentNumber("GOODS_RETURN", this.constructor);
    }
    if (!this.returnReference) {
      this.returnReference = await generateNextDocumentNumber("GOODS_RETURN_REFERENCE", this.constructor);
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Zod validation — FIXED: added productId + sku as required
// ─────────────────────────────────────────────────────────────────────────────
export const GoodsReturnItemValidation = z.object({
  productId:   z.string().min(1, "productId is required"),  // ✅ added
  sku:         z.string().min(1, "sku is required"),         // ✅ added
  productName: z.string().optional(),
  returnQty:   z.number().min(1),
  totalAmount: z.number().min(0),
  unitPrice:   z.number().min(0).optional(),
  status: z
    .enum(["pending", "approved", "in-transit", "completed", "rejected"])
    .optional(),
  itemsNotes: z.string().optional(),
});

export const CreateGoodsReturnValidation = z.object({
  ...commonSchemaValidation,
  grtnNumber:      z.string().optional(),
  returnReference: z.string().optional(),
  grnId:           z.string().min(1, "GRN ID is required"),
  returnedBy:      z.string().min(2),
  returnReason:    z.string().min(2),
  returnDate:      z.coerce.date().optional(),
  items:           z.array(GoodsReturnItemValidation).min(1),
  notes:           z.string().optional(),
  status: z
    .enum(["pending", "approved", "in-transit", "completed", "rejected"])
    .optional(),
});