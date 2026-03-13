import { z } from "zod";
import { Types } from "mongoose";


export const colorSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    colorName: { type: String, required: true },
    colorCode: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}

export const colorSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    colorName: z.string().min(1, "Color name is required"),
    colorCode: z.string().min(1, "Color code is required."),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});


