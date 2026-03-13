import { Document, Types } from "mongoose";


export interface IStockAlert extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    productName: string;
    sku: string;
    category?: string;

    // Stock numbers at time of alert
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
    maxStockLevel: number;
    suggestedOrderQty: number;
    averageDailySales?: number;
    daysUntilStockout?: number;


    supplierId?: Types.ObjectId;
    supplierName: string;
    supplierEmail: string;

    // Alert lifecycle
    severity: "critical" | "warning" | "low";
    status: "pending" | "ordered" | "resolved";

    // Audit
    emailSentAt?: Date;
    resolvedAt?: Date;
    poId?: Types.ObjectId;
    lastOrdered?: Date;

    createdAt: Date;
    updatedAt: Date;
}