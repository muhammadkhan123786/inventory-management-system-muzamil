
import { Document, Model, model, Schema, Types } from "mongoose";

import { IJobTypes } from "../../../common/IJob.types.interface";

import { jobTypesSchema } from "../schemas/job.types.interface";


export type jobTypesDoc = IJobTypes<Types.ObjectId> & Document;
const jobTypesDbSchema = new Schema<jobTypesDoc>({
    ...jobTypesSchema
}, { timestamps: true });


export const jobTypes: Model<jobTypesDoc> = model<jobTypesDoc>("jobTypes", jobTypesDbSchema);
