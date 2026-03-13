
import { Document, Model, model, Schema, Types } from "mongoose";

import { IUnit } from "../../../common/IUnit.interface";

import { unitSchema } from "../schemas/unit.schema";


export type unitDoc = IUnit<Types.ObjectId> & Document;
const unitsDbSchema = new Schema<unitDoc>({
    ...unitSchema
}, { timestamps: true });


export const Unit: Model<unitDoc> = model<unitDoc>("Unit", unitsDbSchema);
