import { z } from "zod";
import { Types } from "mongoose";



export const productSourceSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    productSource: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}



export const productSourceSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    productSource: z.string().min(1, "Product source name is required."),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});


