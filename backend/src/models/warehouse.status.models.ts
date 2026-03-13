
import { Document, Model, model, Schema, Types } from "mongoose";

import { IWarehouseStatus } from "../../../common/IWarehouse.status.interface";

import { wareHouseStatusSchema } from "../schemas/warehouse.status.schema";


export type wareHouseStatusDoc = IWarehouseStatus<Types.ObjectId> & Document;
const wareHouseStatusDbSchema = new Schema<wareHouseStatusDoc>({
    ...wareHouseStatusSchema
}, { timestamps: true });


export const WarehouseStatus: Model<wareHouseStatusDoc> = model<wareHouseStatusDoc>("WarehouseStatus", wareHouseStatusDbSchema);
