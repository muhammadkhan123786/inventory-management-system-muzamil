
import { Document, Model, model, Schema, Types } from "mongoose";

import { ICategory } from "../../../common/ICategory.interface";

import { categorySchema } from "../schemas/category.schema";


export type categoryDoc =
  Omit<ICategory<Types.ObjectId, Types.ObjectId, Types.ObjectId | null>, 'parentId'> &
  Document & {
    parentId?: Types.ObjectId | null;
  };

const categoryDbSchema = new Schema<categoryDoc>({
    ...categorySchema
}, { timestamps: true });


export const Category: Model<categoryDoc> = model<categoryDoc>("Category", categoryDbSchema);
