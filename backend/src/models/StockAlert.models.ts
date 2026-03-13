import mongoose, { Schema, Model } from "mongoose";
import { IStockAlert } from "../../../common/IStockAlert.interface";

const StockAlertSchema = new Schema<IStockAlert>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        productName: { type: String, required: true },
        sku: { type: String, required: true },
        category: { type: String },

        currentStock: { type: Number, required: true },
        reorderPoint: { type: Number, required: true },
        safetyStock: { type: Number, default: 0 },
        maxStockLevel: { type: Number, default: 0 },
        suggestedOrderQty: { type: Number, default: 0 },
        averageDailySales: { type: Number },
        daysUntilStockout: { type: Number },

        supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },
        supplierName: { type: String, default: "" },
        supplierEmail: { type: String, default: "" },

        severity: {
            type: String,
            enum: ["critical", "warning", "low"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "ordered", "resolved"],
            default: "pending",
        },

        emailSentAt: { type: Date },
        resolvedAt: { type: Date },
        poId: { type: Schema.Types.ObjectId, ref: "PurchaseOrder" },
        lastOrdered: { type: Date },
    },
    {
        timestamps: true,
        collection: "stockalerts",
    }
);

// One active (pending) alert per SKU per user at a time
StockAlertSchema.index({ userId: 1, sku: 1, status: 1 });
// Fast lookup for badge count
StockAlertSchema.index({ userId: 1, status: 1 });

// ── Model (safe for hot-reload in Express / Next.js) ─────────────────────────

export const StockAlertModel: Model<IStockAlert> =
    mongoose.models.StockAlert ??
    mongoose.model<IStockAlert>("StockAlert", StockAlertSchema);