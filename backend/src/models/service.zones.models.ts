
import { Document, Model, model, Schema, Types } from "mongoose";

import { IServicesZones } from "../../../common/service.zones.interface";

export type servicesZonesDoc = IServicesZones<Types.ObjectId> & Document;

const serviceZonesSchema = new Schema<servicesZonesDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    serviceZone: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });

export const ServiceZoneModel: Model<servicesZonesDoc> = model<servicesZonesDoc>("ServiceZoneModel", serviceZonesSchema);
