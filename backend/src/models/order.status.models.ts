
import { Document, Model, model, Schema, Types } from "mongoose";

import { IOrderStatus } from "../../../common/order.status.interface";

import { orderStatusSchema } from "../schemas/order.status.schema";


export type orderStatusDoc = IOrderStatus<Types.ObjectId> & Document;
const orderStatusDbSchema = new Schema<orderStatusDoc>({
    ...orderStatusSchema
}, { timestamps: true });


export const orderStatus: Model<orderStatusDoc> = model<orderStatusDoc>("orderStatus", orderStatusDbSchema);
