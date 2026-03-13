
import { Document, Model, model, Schema, Types } from "mongoose";

import { IProductServices } from "../../../../common/suppliers/IServices.interface";

import { productServicesSchema } from "../../schemas/suppliers/product.services.schema";

export type productServicesDoc = IProductServices<Types.ObjectId> & Document;

const productServicesDbSchema = new Schema<productServicesDoc>({

    ...productServicesSchema

}, { timestamps: true });


export const ProductServices: Model<productServicesDoc> = model<productServicesDoc>("ProductServices", productServicesDbSchema);
