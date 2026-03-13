import { z } from "zod";
import { SchemaDefinition, Types } from "mongoose";
import { IProductServices } from '../../../../common/suppliers/IServices.interface';


export const productServicesSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    productServicesName: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}

export const productServicesSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    productServicesName: z.string().min(1, "Product Services name is required"),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});
