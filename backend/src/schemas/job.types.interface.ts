import { z } from "zod";
import { SchemaDefinition, Types } from "mongoose";




export const jobTypesSchema: SchemaDefinition = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    jobTypeName: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}

export const jobTypesSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    jobTypeName: z.string().min(1, "Job type name is required."),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});



