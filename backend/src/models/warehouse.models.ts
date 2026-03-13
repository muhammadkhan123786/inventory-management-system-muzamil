import { Document, Model, model, Schema, Types } from "mongoose";
import { IWarehouse } from "../../../common/IWarehouses.interface";
import { warehouseSchema } from "../schemas/warehouse.schema";

export type warehouseDoc = IWarehouse<
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId
> &
  Document;

const warehouseDbDoc = new Schema<warehouseDoc>(
  {
    ...warehouseSchema,
  },
  { timestamps: true }
);

export const Warehouse: Model<warehouseDoc> = model<warehouseDoc>(
  "Warehouse",
  warehouseDbDoc
);
