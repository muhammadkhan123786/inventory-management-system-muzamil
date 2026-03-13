import { z } from "zod";
import { Types } from "mongoose";


export const taxSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    taxName: { type: String, required: true },
    percentage: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}


export const taxSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    taxName: z.string().min(1, "Tax name is required"),
    percentage: z.number()
        .min(0, "Tax percentage cannot be negative")
        .max(100, "Tax percentage cannot exceed 100"),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
}).refine(
    (data) =>
        !data.startDate ||
        !data.endDate ||
        data.endDate >= data.startDate,
    {
        message: "endDate must be greater than or equal to startDate",
        path: ["endDate"],
    });


