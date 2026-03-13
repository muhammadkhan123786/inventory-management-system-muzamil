// models/goodsReturn.model.ts
// import { model, Document, Schema } from "mongoose";
// import { IGoodsReturnNote } from "../../../common/IGoodsReturn.interface";
// import { GoodsReturnSchema } from "../schemas/goodsReturn.schema";

// export type GoodsReturnDoc = IGoodsReturnNote & Document;

// const goodsReturnDbSchema = new Schema<GoodsReturnDoc>(
//   GoodsReturnSchema,
//   { timestamps: true }
// );

// export const GoodsReturn = model<GoodsReturnDoc>(
//   "GoodsReturn",
//   goodsReturnDbSchema
// );



import { model, Document } from "mongoose";
import { GoodsReturnSchema } from "../schemas/goodsReturn.schema";
import { IGoodsReturnNote } from "../../../common/IGoodsReturn.interface";

export type GoodsReturnDoc = IGoodsReturnNote & Document;

export const GoodsReturn = model<GoodsReturnDoc>(
  "GoodsReturn",
  GoodsReturnSchema
);
