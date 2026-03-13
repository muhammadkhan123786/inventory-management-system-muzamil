
import { Document, Model, model, Schema, Types } from "mongoose";

import { IItemsConditions } from "../../../common/IItems.conditions.interface";

import { itemConditionSchema } from "../schemas/items.condition.schema";


export type itemConditionDoc = IItemsConditions<Types.ObjectId> & Document;
const itemConditionDbSchema = new Schema<itemConditionDoc>({
    ...itemConditionSchema
}, { timestamps: true });


export const ItemsConditions: Model<itemConditionDoc> = model<itemConditionDoc>("ItemsConditions", itemConditionDbSchema);
