
import { Document, Model, model, Schema, Types } from "mongoose";

import { IPricingAgreement } from "../../../../common/suppliers/IPricing.agreement.interface";

import { pricingAgreementSchema } from "../../schemas/suppliers/pricing.agreement.schema";

export type pricingAgreementDoc = IPricingAgreement<Types.ObjectId> & Document;

const pricingAgreementDbSchema = new Schema<pricingAgreementDoc>({

    ...pricingAgreementSchema

}, { timestamps: true });

export const PricingAgreement: Model<pricingAgreementDoc> = model<pricingAgreementDoc>("PricingAgreement", pricingAgreementDbSchema);
