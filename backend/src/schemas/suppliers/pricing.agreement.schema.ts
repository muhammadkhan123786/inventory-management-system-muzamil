import { z } from "zod";
import { SchemaDefinition, Types } from "mongoose";
import { IPricingAgreement } from '../../../../common/suppliers/IPricing.agreement.interface';


export const pricingAgreementSchema = {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    pricingAgreementName: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    isDefault: { type: Boolean, required: true, default: false },
}

export const pricingAgreementSchemaValidation = z.object({
    userId: z.string().min(1, "userId is required"),  // will be converted to ObjectId
    pricingAgreementName: z.string().min(1, "Pricing agreement name is required"),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isDefault: z.boolean().optional(),
});
