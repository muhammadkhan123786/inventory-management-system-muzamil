
import { Document, Model, model, Schema, Types } from "mongoose";

import { IColor } from "../../../common/IColor.interface";

import { colorSchema } from "../schemas/color.schema";


export type colorDoc = IColor<Types.ObjectId> & Document;
const colorDbSchema = new Schema<colorDoc>({
    ...colorSchema
}, { timestamps: true });


export const Color: Model<colorDoc> = model<colorDoc>("Color", colorDbSchema);
