
import { Document, Model, model, Schema, Types } from "mongoose";

import { IPaymentTerms } from "../../../common/IPayment.terms.interface";

export type paymentTermDoc = IPaymentTerms<Types.ObjectId> & Document;

const paymentTermSchema = new Schema<paymentTermDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    paymentTerm: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const paymentTerm: Model<paymentTermDoc> = model<paymentTermDoc>("paymentTerm", paymentTermSchema);
