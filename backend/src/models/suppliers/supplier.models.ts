import { Schema, model, Types, Model, Document } from "mongoose";
import { commonSchema } from "../../schemas/shared/common.schema";
import { ISupplier } from "../../../../common/suppliers/ISuppliers.interface";

export type SupplierBaseDoc = ISupplier<
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId,
  Types.ObjectId[],
  Types.ObjectId,
  Types.ObjectId
> &
  Document;

export const SupplierSchema = new Schema<SupplierBaseDoc>(
  {
    supplierCode: { type: String },
    supplierIdentification: {
      legalBusinessName: { type: String, required: true },
      tradingName: { type: String },
      businessRegNumber: { type: String, required: true },
      vat: { type: String },
      businessTypeId: {
        type: Types.ObjectId,
        ref: "BusinessType",
        required: true,
      },
    },

    contactInformation: {
      primaryContactName: { type: String, required: true },
      jobTitleId: { type: Types.ObjectId, ref: "JobTitles", required: true },
      phoneNumber: { type: String, required: true },
      emailAddress: { type: String },
      website: { type: String },
    },

    businessAddress: {
      businessAddress: { type: String, required: true },
      tradingAddress: { type: String },
      city: { type: Types.ObjectId, ref: "CityModel", required: true },
      state: { type: String, required: true },
      country: { type: Types.ObjectId, ref: "Country", required: true },
      zipCode: { type: String, required: true },
    },

    financialInformation: {
      vatRegistered: { type: Boolean, required: true },
      vatNumber: { type: String },
      taxIdentificationNumber: { type: String, required: true },
      paymentCurrencyId: {
        type: Types.ObjectId,
        ref: "Currency",
        required: true,
      },
      paymentMethodId: {
        type: Types.ObjectId,
        ref: "PaymentMethod",
        required: true,
      },
    },

    bankPaymentDetails: {
      bankName: { type: String },
      accountHolderName: { type: String },
      accountNumber: { type: String },
      sortCode: { type: String },
      ibanNumber: { type: String },
      swiftCode: { type: String },
    },

    productServices: {
      typeOfServiceId: {
        type: Types.ObjectId,
        ref: "ProductServices",
        required: true,
      },
      productCategoryIds: [{ type: Types.ObjectId, ref: "Category" }],
      leadTimes: { type: Number, required: true },
      minimumOrderQuantity: { type: Number, required: true },
    },

    commercialTerms: {
      paymentTermsId: {
        type: Types.ObjectId,
        ref: "paymentTerm",
        required: true,
      },
      pricingAgreementId: {
        type: Types.ObjectId,
        ref: "PricingAgreement",
        required: true,
      },
      discountTerms: { type: String },
      contractStartDate: { type: Date, required: true },
      contractEndDate: { type: Date },
    },

    complianceDocumentation: {
      businessRegistrationCertificates: [{ type: String }],
      insuranceDetails: { type: String },
      insuranceExpiryDate: { type: Date },
      healthAndSafetyCompliance: { type: Boolean },
      qualityCertificate: { type: String },
    },

    operationalInformation: {
      orderContactName: { type: String },
      orderContactEmail: { type: String },
      returnPolicy: { type: String },
      warrantyTerms: { type: String },
    },

    ...commonSchema,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SupplierModel: Model<SupplierBaseDoc> = model<SupplierBaseDoc>(
  "Supplier",
  SupplierSchema,
);
