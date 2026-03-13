
import { Document, Model, model, Schema, Types } from "mongoose";

import { ICurrency } from "../../../common/ICurrency.interface";

export type currencyDoc = ICurrency<Types.ObjectId> & Document;

const currencySchema = new Schema<currencyDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    currencyName: { type: String, required: true },
    currencySymbol: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const Currency: Model<currencyDoc> = model<currencyDoc>("Currency", currencySchema);
