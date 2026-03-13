import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const supplierFormSchema = z.object({
  "supplierIdentification.legalBusinessName": z
    .string()
    .min(1, "Legal business name is required"),
  "supplierIdentification.tradingName": z.string().optional(),
  "supplierIdentification.businessRegNumber": z
    .string()
    .min(1, "Business registration number is required"),
  "supplierIdentification.vat": z.string().optional(),
  "supplierIdentification.businessTypeId": z
    .string()
    .regex(objectIdRegex, "Business type is required"),

  "contactInformation.primaryContactName": z
    .string()
    .min(1, "Primary contact name is required"),
  "contactInformation.jobTitleId": z
    .string()
    .regex(objectIdRegex, "Job title is required"),
  "contactInformation.phoneNumber": z
    .string()
    .min(1, "Phone number is required"),
  "contactInformation.emailAddress": z
    .string()
    .email("Invalid email address")
    .optional(),
  "contactInformation.website": z.string().url("Invalid URL").optional(),

  "businessAddress.businessAddress": z
    .string()
    .min(1, "Business address is required"),
  "businessAddress.tradingAddress": z.string().optional(),
  "businessAddress.city": z.string().min(1, "City is required"),
  "businessAddress.state": z.string().min(1, "State is required"),
  "businessAddress.country": z.string().min(1, "Country is required"),
  "businessAddress.zipCode": z.string().min(1, "ZIP code is required"),

  "financialInformation.vatRegistered": z.boolean(),
  "financialInformation.vatNumber": z.string().optional(),
  "financialInformation.taxIdentificationNumber": z
    .string()
    .min(1, "Tax identification number is required"),
  "financialInformation.paymentCurrencyId": z
    .string()
    .regex(objectIdRegex, "Payment currency is required"),
  "financialInformation.paymentMethodId": z
    .string()
    .regex(objectIdRegex, "Payment method is required"),

  "bankPaymentDetails.bankName": z.string().optional(),
  "bankPaymentDetails.accountHolderName": z.string().optional(),
  "bankPaymentDetails.accountNumber": z.string().optional(),
  "bankPaymentDetails.sortCode": z.string().optional(),
  "bankPaymentDetails.ibanNumber": z.string().optional(),
  "bankPaymentDetails.swiftCode": z.string().optional(),

  "productServices.typeOfServiceId": z
    .string()
    .regex(objectIdRegex, "Service type is required"),
  "productServices.productCategoryIds": z
    .array(z.string())
    .min(1, "At least one product category is required"),
  "productServices.leadTimes": z
    .string()
    .regex(/^\d+$/, "Lead time must be a number"),
  "productServices.minimumOrderQuantity": z
    .string()
    .regex(/^\d+$/, "Minimum order quantity must be a number"),

  "commercialTerms.paymentTermsId": z
    .string()
    .regex(objectIdRegex, "Payment terms are required"),
  "commercialTerms.pricingAgreementId": z
    .string()
    .regex(objectIdRegex, "Pricing agreement is required"),
  "commercialTerms.discountTerms": z.string().optional(),
  "commercialTerms.contractStartDate": z
    .string()
    .min(1, "Contract start date is required"),
  "commercialTerms.contractEndDate": z.string().optional(),

  "complianceDocumentation.businessRegistrationCertificates": z
    .array(z.string())
    .optional(),
  "complianceDocumentation.insuranceDetails": z.string().optional(),
  "complianceDocumentation.insuranceExpiryDate": z.string().optional(),
  "complianceDocumentation.healthAndSafetyCompliance": z.boolean().optional(),
  "complianceDocumentation.qualityCertificate": z.string().optional(),

  "operationalInformation.orderContactName": z.string().optional(),
  "operationalInformation.orderContactEmail": z
    .string()
    .email("Invalid email")
    .optional(),
  "operationalInformation.returnPolicy": z.string().optional(),
  "operationalInformation.warrantyTerms": z.string().optional(),

  userId: z.string().regex(objectIdRegex, "User ID is required"),
});

export type SupplierFormData = z.infer<typeof supplierFormSchema>;
