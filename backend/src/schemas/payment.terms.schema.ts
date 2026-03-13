import { z } from "zod";

export const paymentTermCreateSchema = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    paymentTerm: z.string().min(1, "Payment Term name is required"),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});