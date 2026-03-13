// src/schemas/purchaseOrder.schema.ts
// ─────────────────────────────────────────────────────────────────────────────
// This file was accidentally pasted into purchaseOrderCustom.controller.ts.
// It belongs HERE as its own file.
//
// Place at:  src/schemas/purchaseOrder.schema.ts
//   (or wherever your other schema files live, e.g. src/models/purchaseOrder.schema.ts)
// ─────────────────────────────────────────────────────────────────────────────

import { z }                         from "zod";
import { Schema, Types }             from "mongoose";
import { commonSchema, commonSchemaValidation } from "./shared/common.schema";

// ── Item sub-schema ───────────────────────────────────────────────────────────

export const PurchaseOrderItemSchema = new Schema(
  {
    productId: {
      type:     Types.ObjectId,
      ref:      "Product",
      required: true,
    },
    productName: {          // ✅ added — stored for display without population
      type:    String,
      default: "",
    },
    sku: {                  // ✅ added — needed for alert resolution by SKU
      type:    String,
      default: "",
    },
    quantity: {
      type:     Number,
      required: true,
      min:      1,
    },
    unitPrice: {
      type:     Number,
      required: true,
      min:      0,
    },
    totalPrice: {           // ✅ added — quantity * unitPrice, stored for fast reads
      type:    Number,
      default: 0,
      min:     0,
    },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

export const PurchaseOrderSchema = new Schema(
  {
    ...commonSchema,
    orderNumber: {
      type:   String,
      unique: true,
    },
    poReference: {
      type: String,
    },
    supplier: {
      type:     Schema.Types.ObjectId,
      ref:      "Supplier",
      required: true,
    },
    orderDate: {
      type:    Date,
      default: Date.now,
    },
    expectedDelivery: {
      type:     Date,
      required: true,
    },
    status: {
      type:    String,
      enum:    ["draft", "pending", "approved", "ordered", "received", "cancelled"],
      default: "draft",
    },
    items: {
      type:     [PurchaseOrderItemSchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length > 0,
        message:   "Purchase order must have at least one item",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax:      { type: Number, required: true, min: 0 },  // VAT amount (20%)
    total:    { type: Number, required: true, min: 0 },
    notes:    { type: String, default: "" },
    orderContactEmail: {    // ✅ added — supplier email copied at time of order
      type:    String,
      default: "",
    },
    isReorderPO: {          // ✅ added — true when created by bulk replenishment
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index(
  { orderNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

// ── Zod validation ────────────────────────────────────────────────────────────

export const purchaseOrderItemZodSchema = z.object({
  productId: z.string(),
  quantity:  z.number().min(1),
  unitPrice: z.number().nonnegative(),
});

export const purchaseOrderZodSchema = z.object({
  ...commonSchemaValidation,
  orderNumber:  z.string().optional(),
  poReference:  z.string().optional(),
  supplier: z.union([
    z.string(),
    z.object({ _id: z.string() }).passthrough(),
  ]).transform(val => (typeof val === "string" ? val : val._id)),
  orderDate: z.coerce.date().optional().default(() => new Date()),
  expectedDelivery: z.coerce.date(),
  status: z
    .enum(["draft", "pending", "approved", "ordered", "received", "cancelled"])
    .default("draft"),
  items: z.array(purchaseOrderItemZodSchema).min(1, "At least one item is required"),
  subtotal: z.number().nonnegative("Subtotal must be non-negative"),
  tax:      z.number().nonnegative("Tax must be non-negative"),
  total:    z.number().nonnegative("Total must be non-negative"),
  notes:    z.string().optional(),
  orderContactEmail: z.string().optional(),
  isReorderPO:       z.boolean().optional(),
});