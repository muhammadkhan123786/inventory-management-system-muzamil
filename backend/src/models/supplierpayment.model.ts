// src/models/supplierPayment.model.ts
// ─────────────────────────────────────────────────────────────────────────────
// Supplier ko jo payment ki — bank transfer, cheque, cash etc.
// Stripe/PayPal nahi — manual B2B payment tracking
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document } from "mongoose";

export interface ISupplierPayment extends Document {
  supplierId:     mongoose.Types.ObjectId;
  purchaseOrderId?: mongoose.Types.ObjectId; // Optional — specific PO ke against
  grnId?:         mongoose.Types.ObjectId;   // Optional — specific GRN ke against

  paymentNumber:  string;   // PAY-2026-001
  amount:         number;   // Kitna pay kiya
  currency:       string;   // GBP, USD, PKR

  paymentMethod:  "bank_transfer" | "cheque" | "cash" | "credit_note" | "other";
  paymentStatus:  "pending" | "completed" | "failed" | "cancelled";

  paymentDate:    Date;
  referenceNumber?: string; // Bank ref, cheque number etc.
  notes?:         string;

  // Credit note apply kiya? (goods return se)
  creditNoteId?:  mongoose.Types.ObjectId;
  creditApplied?: number; // Kitna credit use kiya is payment mein

  recordedBy:     mongoose.Types.ObjectId; // User ID
  createdAt:      Date;
  updatedAt:      Date;
}

const SupplierPaymentSchema = new Schema<ISupplierPayment>(
  {
    supplierId:      { type: Schema.Types.ObjectId, ref: "Supplier",       required: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder"  },
    grnId:           { type: Schema.Types.ObjectId, ref: "GRN"            },

    paymentNumber:   { type: String, required: true, unique: true },
    amount:          { type: Number, required: true, min: 0 },
    currency:        { type: String, default: "GBP" },

    paymentMethod: {
      type:    String,
      enum:    ["bank_transfer", "cheque", "cash", "credit_note", "other", "online"],
      default: "bank_transfer",
    },
    paymentStatus: {
      type:    String,
      enum:    ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },

    paymentDate:     { type: Date, required: true, default: Date.now },
    referenceNumber: { type: String },
    notes:           { type: String },

    creditNoteId:    { type: Schema.Types.ObjectId, ref: "SupplierCreditNote" },
    creditApplied:   { type: Number, default: 0 },

    recordedBy:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexes
SupplierPaymentSchema.index({ supplierId: 1, createdAt: -1 });
SupplierPaymentSchema.index({ purchaseOrderId: 1 });
SupplierPaymentSchema.index({ paymentNumber: 1 }, { unique: true });

// Auto-generate payment number
SupplierPaymentSchema.pre("validate", async function () {
  if (!this.paymentNumber) {
    const count = await mongoose.model("SupplierPayment").countDocuments();
    const year  = new Date().getFullYear();
    this.paymentNumber = `PAY-${year}-${String(count + 1).padStart(3, "0")}`;
  }
 
});

export const SupplierPayment = mongoose.model<ISupplierPayment>(
  "SupplierPayment",
  SupplierPaymentSchema
);