
import { Document, Model, model, Schema, Types } from "mongoose";

import { ServiceRequestPrioprity } from "../../../common/IService.request.priority.interface";

export type ServiceRequestPrioprityDoc = ServiceRequestPrioprity<Types.ObjectId> & Document;

const ServiceRequestPriopritySchema = new Schema<ServiceRequestPrioprityDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    serviceRequestPrioprity: { type: String, required: true },
    description: { type: String, required: true },
    backgroundColor: { type: String, required: true },
    index: {
        type: Number,
        unique: true,
        sparse: true
    },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const ServiceRequestPrioprityModel: Model<ServiceRequestPrioprityDoc> = model<ServiceRequestPrioprityDoc>("ServiceRequestPrioprityModel", ServiceRequestPriopritySchema);
