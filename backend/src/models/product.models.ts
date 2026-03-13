// product.model.ts
import { Document, Model, model, Schema, HydratedDocument } from "mongoose";
import { IProduct } from "../../../common/IProduct.interface";
import { ProductSchema } from "../schemas/product.schema";

export type ProductDoc = HydratedDocument<IProduct> & Document;

const productSchemaInstance = new Schema<ProductDoc>(
  ProductSchema,
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchemaInstance.virtual('ui_price').get(function() {
  const price = this.attributes?.[0]?.pricing?.[0]?.sellingPrice || 0;
  return price;
});

productSchemaInstance.virtual('ui_totalStock').get(function() {
  const total = this.attributes?.reduce((sum, attr) => 
    sum + (attr?.stock?.stockQuantity || 0), 0
  ) || 0;
  return total;
});

export const ProductModal: Model<ProductDoc> =
  model<ProductDoc>("Product", productSchemaInstance);