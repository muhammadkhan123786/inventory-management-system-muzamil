import { Schema, model } from "mongoose";

const purchaseOrderCounterSchema = new Schema(
    {
        year: { type: Number, required: true, unique: true },
        seq: { type: Number, default: 0 }

    },
    { timestamps: true }
);

export const PurchaseOrderCounter = model("PurchaseOrderCounter", purchaseOrderCounterSchema);
