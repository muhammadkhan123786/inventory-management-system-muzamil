import { z } from "zod";
import { Types } from "mongoose";

export const categorySchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    parentId: { type: Types.ObjectId, ref: "Category", default: null },
    name: { type: String },
    categoryName: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}



export const categorySchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    categoryName: z.string().min(1, "Currency name is required"),
    name:z.string().optional(),
    parentId: z.string().regex(/^[0-9a-fA-F]{24}$/).nullable().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});


