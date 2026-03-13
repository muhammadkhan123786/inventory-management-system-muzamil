import { Types } from 'mongoose';
import { z } from 'zod';

export const commonSchemaValidation = {
    userId: z.string().min(1, "userId is required"),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
}

export const commonSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}
