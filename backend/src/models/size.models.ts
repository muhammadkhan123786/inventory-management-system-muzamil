
import { Document, Model, model, Schema, Types } from "mongoose";

import { ISize } from "../../../common/ISize.interface";

import { sizeSchema } from "../schemas/size.schema";


export type sizeDoc = ISize<Types.ObjectId> & Document;
const sizeDbSchema = new Schema<sizeDoc>({
    ...sizeSchema
}, { timestamps: true });


export const Size: Model<sizeDoc> = model<sizeDoc>("Size", sizeDbSchema);
