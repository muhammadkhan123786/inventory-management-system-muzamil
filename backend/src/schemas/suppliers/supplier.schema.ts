import { z } from "zod";
import { commonSchemaValidation } from "../shared/common.schema";
import { objectIdOrStringSchema, objectIdSchema } from "../../validators/objectId.schema";

export const emailString = z.string().refine(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: "Invalid email address" }
);

export const numericString = z.string().refine(
    (val) => /^\d+$/.test(val),
    { message: "Only numeric values allowed" }
);

export const isoDateString = z.string().refine(
    (val) => !Number.isNaN(Date.parse(val)),
    { message: "Invalid date format" }
);

export const urlString = z.string().refine(
    (val) => {
        if (!val) return true; // allow optional
        try {
            const u = new URL(val);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    },
    { message: "Invalid URL" }
);



export const supplierSchemaValidation = z.object({
    supplierIdentification: z.object({
        legalBusinessName: z.string().min(1),
        tradingName: z.string().optional(),
        businessRegNumber: z.string().min(1),
        vat: z.string().optional(),
        businessTypeId: objectIdSchema
    }),

    contactInformation: z.object({
        primaryContactName: z.string().min(1),
        jobTitleId: objectIdSchema,
        phoneNumber: z.string().min(1),
        emailAddress: emailString.optional(),
        website: urlString.optional(),
    }),

    businessAddress: z.object({
        businessAddress: z.string().min(1),
        tradingAddress: z.string().optional(),
        city: objectIdOrStringSchema,
        state: z.string().min(1),
        country: objectIdOrStringSchema,
        zipCode: z.string().min(1),
    }),

    financialInformation: z.object({
        vatRegistered: z.boolean(),
        vatNumber: z.string().optional(),
        taxIdentificationNumber: z.string().min(1),
        paymentCurrencyId: objectIdSchema,
        paymentMethodId: objectIdSchema,
    }),

    bankPaymentDetails: z
        .object({
            bankName: z.string().min(1),
            accountHolderName: z.string().min(1),
            accountNumber: z.string().min(1),
            sortCode: z.string().optional(),
            ibanNumber: z.string().optional(),
            swiftCode: z.string().optional(),
        })
        .optional(),

    productServices: z.object({
        typeOfServiceId: objectIdSchema,
        productCategoryIds: z.array(z.string()).min(1),
        leadTimes: numericString,
        minimumOrderQuantity: numericString,
    }),

    commercialTerms: z.object({
        paymentTermsId: objectIdSchema,
        pricingAgreementId: objectIdSchema,
        discountTerms: z.string().optional(),
        contractStartDate: isoDateString,
        contractEndDate: isoDateString.optional(),
    }),

    complianceDocumentation: z
        .object({
            businessRegistrationCertificates: z.array(z.string()).optional(),
            insuranceDetails: z.string().optional(),
            insuranceExpiryDate: isoDateString.optional(),
            healthAndSafetyCompliance: z.boolean().optional(),
            qualityCertificate: z.string().optional(),
        })
        .optional(),

    operationalInformation: z
        .object({
            orderContactName: z.string().optional(),
            orderContactEmail: emailString,
            returnPolicy: z.string().optional(),
            warrantyTerms: z.string().optional(),
        })
        .optional(),
    ...commonSchemaValidation
});

export const supplierSchemaWithVatCheck = supplierSchemaValidation.superRefine(
    (data, ctx) => {
        if (data.financialInformation.vatRegistered && !data.financialInformation.vatNumber) {
            ctx.addIssue({
                path: ["financialInformation", "vatNumber"],
                message: "VAT number is required when VAT is registered",
                code: "custom",
            });
        }
    }
);




