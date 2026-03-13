
import { Document, Model, model, Schema, Types } from "mongoose";

import { ICountry } from "../../../common/Country.interface";

export type countryDoc = ICountry<Types.ObjectId> & Document;

const countrySchema = new Schema<countryDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    countryName: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const Country: Model<countryDoc> = model<countryDoc>("Country", countrySchema);
