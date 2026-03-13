import { z } from "zod";
import { Types } from "mongoose";


export const wareHouseStatusSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    wareHouseStatus: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}

export const wareHouseStatusSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    wareHouseStatus: z.string().min(1, "Warehouse Status is required"),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});


