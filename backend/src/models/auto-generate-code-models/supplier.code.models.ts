import { Schema, model } from "mongoose";

const supplierCounterSchema = new Schema(
    {
        year: { type: Number, required: true, unique: true },
        seq: { type: Number, default: 0 }

    },
    { timestamps: true }
);

export const SuplierSequenceCounter = model("SuplierSequenceCounter", supplierCounterSchema);
