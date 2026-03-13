
import { Document, Model, model, Schema, Types } from "mongoose";

import { IPaymentMethod } from "../../../../common/suppliers/IPayment.method.interface";

import { paymentMethodSchema } from "../../schemas/suppliers/payment.method.schema";

export type paymentMethodDoc = IPaymentMethod<Types.ObjectId> & Document;

const paymentMethodDbSchema = new Schema<paymentMethodDoc>({

    ...paymentMethodSchema

}, { timestamps: true });


export const PaymentMethod: Model<paymentMethodDoc> = model<paymentMethodDoc>("PaymentMethod", paymentMethodDbSchema);
