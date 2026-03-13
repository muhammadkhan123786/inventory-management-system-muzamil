import { Document, Model, model, Schema, Types } from "mongoose";
import { IServicesMasterInterface } from "../../../common/IServices.master.interface";

export type ServiceTypeMasterDoc = IServicesMasterInterface<Types.ObjectId> & Document;

const ServiceTypeMasterSchema = new Schema<ServiceTypeMasterDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    MasterServiceType: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const ServiceTypeMaster: Model<ServiceTypeMasterDoc> = model<ServiceTypeMasterDoc>("ServiceTypeMaster", ServiceTypeMasterSchema);
