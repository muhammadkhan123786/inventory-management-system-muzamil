
import { Document, Model, model, Schema, Types } from "mongoose";

import { IProductSource } from "../../../common/IProduct.source.interface";

import { productSourceSchema } from "../schemas/product.source.schema";


export type productSourceDbDoc = IProductSource<Types.ObjectId> & Document;
const productSourceDbSchema = new Schema<productSourceDbDoc>({
    ...productSourceSchema
}, { timestamps: true });


export const ProductSource: Model<productSourceDbDoc> = model<productSourceDbDoc>("ProductSource", productSourceDbSchema);
