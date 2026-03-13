
import { Document, Model, model, Schema, Types } from "mongoose";

import { IJobTitles } from "../../../../common/suppliers/IJob.titles";

import { jobTitleSchema } from "../../schemas/master-data/job.titles.schema";

export type jobTitleDoc = IJobTitles<Types.ObjectId> & Document;

const jobTitleDbSchema = new Schema<jobTitleDoc>({

    ...jobTitleSchema

}, { timestamps: true });


export const JobTitles: Model<jobTitleDoc> = model<jobTitleDoc>("JobTitles", jobTitleDbSchema);
