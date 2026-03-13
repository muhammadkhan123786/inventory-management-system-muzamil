import { Document, Model, model, Schema } from "mongoose";
import { IAttribute } from "../../../common/IProductAttributes.interface";
import { attributeSchema } from "../schemas/product.attributes.schema";

export type ProductAttributeDoc = IAttribute & Document;

const productAttributesDbSchema = new Schema<ProductAttributeDoc>(
  attributeSchema,
  { timestamps: true }
);

export const ProductAttributes: Model<ProductAttributeDoc> =
  model<ProductAttributeDoc>("ProductAttributes", productAttributesDbSchema);
