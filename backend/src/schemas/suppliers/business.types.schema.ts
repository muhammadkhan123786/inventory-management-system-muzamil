import { z } from "zod";
import { SchemaDefinition, Types } from "mongoose";
import { IBusinessTypes } from '../../../../common/suppliers/IBusiness.types.interface';


export const businessTypeSchema= {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    businessTypeName: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}

export const businessTypeSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    businessTypeName: z.string().min(1, "Business Type name is required"),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});


