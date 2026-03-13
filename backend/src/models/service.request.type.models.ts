
import { Document, Model, model, Schema, Types } from "mongoose";

import { IServiceRequestType } from "../../../common/IService.request.types.interface";

export type serviceRequestTypeDoc = IServiceRequestType<Types.ObjectId> & Document;

const serviceRequestTypeSchema = new Schema<serviceRequestTypeDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    serviceRequestType: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const serviceRequestTypeModel: Model<serviceRequestTypeDoc> = model<serviceRequestTypeDoc>("serviceRequestTypeModel", serviceRequestTypeSchema);
