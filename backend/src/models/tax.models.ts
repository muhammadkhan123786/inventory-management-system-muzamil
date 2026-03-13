
import { Document, Model, model, Schema, Types } from "mongoose";

import { ITax } from "../../../common/ITax.interface";
import { taxSchema } from '../schemas/tax.schema';

export type taxDoc = ITax<Types.ObjectId> & Document;

const taxSchemaDbDoc = new Schema<taxDoc>({
    ...taxSchema
}, { timestamps: true });

export const Tax: Model<taxDoc> = model<taxDoc>("Tax", taxSchemaDbDoc);
