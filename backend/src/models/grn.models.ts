// import { Document, Model, model, Schema } from "mongoose";
// import { IGoodsReceivedNote } from "../../../common/IGRN.interface";
// import { GoodsReceivedSchema } from "../schemas/grn.schema";

// export type grnDoc = IGoodsReceivedNote & Document;

// const grnDbSchema = new Schema<grnDoc>(
//   GoodsReceivedSchema,
//   { timestamps: true }
// );

// export const grn: Model<grnDoc> =
//   model<grnDoc>("grn", grnDbSchema);

// models/grn.model.ts
import { model, Document } from "mongoose";
import { GoodsReceivedSchema } from "../schemas/grn.schema";
import { IGoodsReceivedNote } from "../../../common/IGRN.interface";

export type GrnDoc = IGoodsReceivedNote & Document;

export const GrnModel = model<GrnDoc>(
  "grn",
  GoodsReceivedSchema
);
