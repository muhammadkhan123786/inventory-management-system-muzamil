import { Schema, model, Document, Types } from "mongoose";

export interface IAddress extends Document {
  address: string;
  countryId?: Types.ObjectId; // reference to country collection
  userId: Types.ObjectId;
  cityId?: Types.ObjectId;
  city?: string;
  zipCode?: string;
  latitude?: string;
  longitude?: string;
  isActive: boolean;
  isDeleted: boolean;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    address: { type: String, required: true },
    countryId: { type: Schema.Types.ObjectId, ref: "Country" },
    cityId: { type: Schema.Types.ObjectId, ref: "CityModel" },
    city: { type: String },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    zipCode: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Capitalized singular model name
export const Address = model<IAddress>("Address", addressSchema);
