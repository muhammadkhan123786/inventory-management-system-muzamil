import { z } from "zod";

export const currencyCreateSchema = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    currencyName: z.string().min(1, "Currency name is required"),
    currencySymbol: z.string().min(1, "Currency symbol is required."),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});