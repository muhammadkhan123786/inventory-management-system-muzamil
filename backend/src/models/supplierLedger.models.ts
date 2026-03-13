import mongoose, { Document, Schema, Model } from "mongoose";
import {
  LedgerDirection,
  LedgerEntryType,
  LedgerRefType,
} from "../../../common/ISupplierledger.interface";
// ─────────────────────────────────────────────────────────────────────────────
//  SupplierLedger Model
//  Collection: supplierledgers
//
//  How balance works:
//    GRN received  → DEBIT  → balanceAfter = balanceBefore + amount  (we owe more)
//    GRTN completed → CREDIT → balanceAfter = balanceBefore - amount  (we owe less)
//    Payment made  → CREDIT → balanceAfter = balanceBefore - amount  (we owe less)
// ─────────────────────────────────────────────────────────────────────────────

export interface ISupplierLedger extends Document {
  supplierId:       mongoose.Types.ObjectId;
  type:             LedgerEntryType;
  direction:        LedgerDirection;
  amount:           number;
  referenceType:    LedgerRefType;
  referenceId?:     mongoose.Types.ObjectId;
  referenceNumber?: string;
  balanceBefore:    number;
  balanceAfter:     number;
  date:             Date;
  notes?:           string;
  createdBy?:       string;
  createdAt:        Date;
  updatedAt:        Date;
}

const SupplierLedgerSchema = new Schema<ISupplierLedger>(
  {
    supplierId: {
      type:     Schema.Types.ObjectId,
      ref:      "Supplier",
      required: [true, "Supplier ID is required"],
      index:    true,
    },
    type: {
      type:     String,
      enum:     ["purchase", "return", "payment", "adjustment"],
      required: [true, "Entry type is required"],
    },
    direction: {
      type:     String,
      enum:     ["debit", "credit"],
      required: [true, "Direction is required"],
    },
    amount: {
      type:     Number,
      required: [true, "Amount is required"],
      min:      [0, "Amount must be non-negative"],
    },
    referenceType: {
      type: String,
      enum: ["GRN", "GRTN", "PAYMENT", "MANUAL"],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      // Dynamically points to GRN._id or GRTN._id or SupplierPayment._id
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    // Running balance snapshots for fast reads — O(1) lookup
    balanceBefore: {
      type:    Number,
      default: 0,
    },
    balanceAfter: {
      type:    Number,
      default: 0,
    },
    date: {
      type:    Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Most common query: supplier's full history ordered by time
SupplierLedgerSchema.index({ supplierId: 1, createdAt: 1 });

// Fast "get last entry for running balance"
SupplierLedgerSchema.index({ supplierId: 1, createdAt: -1 });

// Lookup by source document
SupplierLedgerSchema.index({ referenceId: 1 });

// Filter by type per supplier (dashboard breakdown)
SupplierLedgerSchema.index({ type: 1, supplierId: 1 });

const SupplierLedger: Model<ISupplierLedger> = mongoose.model<ISupplierLedger>(
  "SupplierLedger",
  SupplierLedgerSchema
);

export default SupplierLedger;