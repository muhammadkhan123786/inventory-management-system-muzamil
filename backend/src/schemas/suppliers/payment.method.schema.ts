import { z } from "zod";
import { SchemaDefinition, Types } from "mongoose";
import { IPaymentMethod } from '../../../../common/suppliers/IPayment.method.interface';


export const paymentMethodSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    paymentMethodName: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}

export const paymentMethodSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    paymentMethodName: z.string().min(1, "Payment method name is required"),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});
