// // product.model.ts
// import { Document, Model, model, Schema, HydratedDocument } from "mongoose";
// import { IProduct } from "../../../common/IProduct.interface";
// import { ProductSchema } from "../schemas/product.schema";

// export type ProductDoc = HydratedDocument<IProduct> & Document;

// const productSchemaInstance = new Schema<ProductDoc>(
//   ProductSchema,
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// productSchemaInstance.virtual('ui_price').get(function() {
//   const price = this.attributes?.[0]?.pricing?.[0]?.sellingPrice || 0;
//   return price;
// });

// productSchemaInstance.virtual('ui_totalStock').get(function() {
//   const total = this.attributes?.reduce((sum, attr) => 
//     sum + (attr?.stock?.stockQuantity || 0), 0
//   ) || 0;
//   return total;
// });

// export const ProductModal: Model<ProductDoc> =
//   model<ProductDoc>("Product", productSchemaInstance);

// ─────────────────────────────────────────────────────────────────────────────
// product.model.ts
// ─────────────────────────────────────────────────────────────────────────────
import { Document, Model, model, Schema, HydratedDocument } from "mongoose";
import { IProduct } from "../../../common/IProduct.interface";
import { ProductSchema } from "../schemas/product.schema";
import { syncStockStatusOnDoc } from "../utils/stock-status.util";

export type ProductDoc = HydratedDocument<IProduct> & Document;

const productSchemaInstance = new Schema<ProductDoc>(
  ProductSchema,
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUALS ──────────────────────────────────────────────────────────────
productSchemaInstance.virtual("ui_price").get(function () {
  return this.attributes?.[0]?.pricing?.[0]?.sellingPrice || 0;
});

productSchemaInstance.virtual("ui_totalStock").get(function () {
  return (
    this.attributes?.reduce(
      (sum, attr) => sum + (attr?.stock?.stockQuantity || 0),
      0
    ) || 0
  );
});

productSchemaInstance.virtual("ui_stockStatus").get(function () {
  const statuses = (this.attributes || []).map(
    (attr: any) => attr?.stock?.stockStatus || "in-stock"
  );
  if (statuses.includes("out-of-stock")) return "out-of-stock";
  if (statuses.includes("low-stock"))    return "low-stock";
  return "in-stock";
});

// ─── HOOK 1: PRE('SAVE') ──────────────────────────────────────────────────────
// Isay ASYNC rakhein aur NEXT ko remove kar dein error se bachne ke liye
productSchemaInstance.pre("save", async function (this: any) {
  (this.attributes || []).forEach((attr: any) => {
    syncStockStatusOnDoc(attr?.stock);
  });
  // Async function mein next() ki zaroorat nahi
});

// ─── HOOK 2: PRE('FINDONEANDUPDATE') ─────────────────────────────────────────
(productSchemaInstance as Schema).pre("findOneAndUpdate", async function (this: any) {
  const update = this.getUpdate() as any;

  // $set style
  const attrsViaSet = update?.$set?.attributes;
  if (Array.isArray(attrsViaSet)) {
    attrsViaSet.forEach((attr: any) => syncStockStatusOnDoc(attr?.stock));
  }

  // Direct style
  const attrsDirect = update?.attributes;
  if (Array.isArray(attrsDirect)) {
    attrsDirect.forEach((attr: any) => syncStockStatusOnDoc(attr?.stock));
  }
});

// ─── HOOK 3: PRE('INSERTMANY') ───────────────────────────────────────────────
// Bracket notation + Async (Best for bypass)
(productSchemaInstance as any).pre("insertMany", async function (docs: any[]) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      doc.attributes?.forEach((attr: any) => {
        syncStockStatusOnDoc(attr?.stock);
      });
    });
  }
});

export const ProductModal: Model<ProductDoc> =
  model<ProductDoc>("Product", productSchemaInstance);