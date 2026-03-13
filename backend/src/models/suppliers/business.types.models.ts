
import { Document, Model, model, Schema, Types } from "mongoose";

import { IBusinessTypes } from "../../../../common/suppliers/IBusiness.types.interface";

import { businessTypeSchema } from "../../schemas/suppliers/business.types.schema";



export type businessTypeDoc = IBusinessTypes<Types.ObjectId> & Document;
const businessTypeDbSchema = new Schema<businessTypeDoc>({
    ...businessTypeSchema
}, { timestamps: true });


export const BusinessType: Model<businessTypeDoc> = model<businessTypeDoc>("BusinessType", businessTypeDbSchema);
