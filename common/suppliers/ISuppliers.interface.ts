import { IBaseEntity } from "../Base.Interface";

export interface ISupplier<TUSERID = string, TBusinessTypeId = string, TJobTitleId = string, ICityId = string, TCountryId = string, TPaymentCurrencyId = string, TPaymentMethodId = string, TTypeOfServiceId = string, TProductCategoryIds = string[], TPaymentTermsId = string, TPricingAgreementId = string> extends IBaseEntity<TUSERID> {
    supplierCode?: string;
    supplierIdentification: {
        legalBusinessName: string;
        tradingName?: string;
        businessRegNumber: string;
        vat?: string;
        businessTypeId: TBusinessTypeId;
    };

    contactInformation: {
        primaryContactName: string;
        jobTitleId: TJobTitleId;
        phoneNumber: string;
        emailAddress: string;
        website?: string;
    };

    businessAddress: {
        businessAddress: string;
        tradingAddress?: string;
        city: ICityId;
        state: string;
        country: TCountryId;
        zipCode: string;
    };

    financialInformation: {
        vatRegistered: boolean;
        vatNumber?: string;
        taxIdentificationNumber: string;
        paymentCurrencyId: TPaymentCurrencyId;
        paymentMethodId: TPaymentMethodId;
    };

    bankPaymentDetails?: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
        sortCode?: string;
        ibanNumber?: string;
        swiftCode?: string;
    };

    productServices: {
        typeOfServiceId: TTypeOfServiceId;
        productCategoryIds: TProductCategoryIds;
        leadTimes: string;
        minimumOrderQuantity: string;
    };

    commercialTerms: {
        paymentTermsId: TPaymentTermsId;
        pricingAgreementId: TPricingAgreementId;
        discountTerms?: string;
        contractStartDate: string; // ISO date
        contractEndDate?: string;
    };

    complianceDocumentation?: {
        businessRegistrationCertificates?: string[];
        insuranceDetails?: string;
        insuranceExpiryDate?: string; // ISO date
        healthAndSafetyCompliance?: boolean;
        qualityCertificate?: string;
    };

    operationalInformation?: {
        orderContactName?: string;
        orderContactEmail?: string;
        returnPolicy?: string;
        warrantyTerms?: string;
    };

}
