
import { Document, Model, model, Schema, Types } from "mongoose";

import { ICityInterface } from "../../../common/City.interface";


export type CityModelDoc = ICityInterface<Types.ObjectId, Types.ObjectId> & Document;

const cityModelSchema = new Schema<CityModelDoc>({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    countryId: { type: Types.ObjectId, ref: "Country", required: true },
    cityName: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}, { timestamps: true });


export const CityModel: Model<CityModelDoc> = model<CityModelDoc>("CityModel", cityModelSchema);
