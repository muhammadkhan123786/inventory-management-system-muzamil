// import { Schema, Document, Types } from "mongoose";
// import { IPurchaseOrder } from '../../../common/IPurchase.order.interface';

// export interface PurchaseOrderDoc extends IPurchaseOrder, Document {}

// const purchaseOrderItemSchema = new Schema(
//   {
//     productName: { type: String, required: true },
//     sku: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     unitPrice: { type: Number, required: true },
//     totalPrice: { type: Number, required: true },
//   },
//   { _id: false }
// );

// export const PurchaseOrders = new Schema<PurchaseOrderDoc>(
//   {
//     orderNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     supplier: {
//       type: Schema.Types.ObjectId, 
//       ref: "Supplier",
//       required: true,
//     },
//     supplierContact: {
//       type: String,
//       required: true,
//     },
//     orderDate: {
//       type: Date,
//       default: Date.now,
//     },
//     expectedDelivery: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'],
//       default: 'draft',
//     },
//     items: {
//       type: [purchaseOrderItemSchema],
//       required: true,
//       validate: {
//         validator: function(v: any[]) {
//           return v.length > 0; // Ensure at least one item
//         },
//         message: 'Purchase order must have at least one item'
//       }
//     },
//     subtotal: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     tax: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     total: {
//       type: Number,
//       required: true,
//       min: 0
//     },
//     notes: {
//       type: String,
//       default: "",
//     },
//   },
//   { timestamps: true }
// );

// // Optional: Add pre-save middleware to calculate totals
// PurchaseOrders.pre('save', function(next) {
//   if (this.isModified('items')) {
//     const subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
//     this.subtotal = subtotal;
//     this.total = subtotal + (this.tax || 0);
//   }
//   next();
// });

// import { Document, Model, model, Schema } from "mongoose";
// import { IPurchaseOrder } from "../../../common/IPurchase.order.interface";
// import { purchaseOrderSchema } from "../schemas/purchaseOrder.schema";

// export type PurchaseDoc = IPurchaseOrder & Document;

// const purchaseDbSchema = new Schema<PurchaseDoc>(
//   purchaseOrderSchema,
//   { timestamps: true }
// );

// export const PurchaseOrder: Model<PurchaseDoc> =
//   model<PurchaseDoc>("PurchaseOrder", purchaseDbSchema);

import { model, Document } from "mongoose";
import { PurchaseOrderSchema } from "../schemas/purchaseOrder.schema";
import { IPurchaseOrder } from "../../../common/IPurchase.order.interface";

export type PurchaseDoc = IPurchaseOrder & Document;

export const PurchaseOrder = model<PurchaseDoc>(
  "PurchaseOrder",
  PurchaseOrderSchema
);


