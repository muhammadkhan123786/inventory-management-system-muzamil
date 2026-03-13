export interface SupplierDTO {
    supplierIdentification: {
        legalBusinessName: string;
        tradingName?: string;
        businessRegNumber: string;
        vat?: string;
        businessTypeId: string;
    };

    contactInformation: {
        primaryContactName: string;
        jobTitleId: string;
        phoneNumber: string;
        emailAddress: string;
        website?: string;
    };

    businessAddress: {
        businessAddress: string;
        tradingAddress?: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };

    financialInformation: {
        vatRegistered: boolean;
        vatNumber?: string;
        taxIdentificationNumber: string;
        paymentCurrencyId: string;
        paymentMethodId: string;
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
        typeOfServiceId: string;
        productCategoryIds: string[];
        leadTimes: string;
        minimumOrderQuantity: string;
    };

    commercialTerms: {
        paymentTermsId: string;
        pricingAgreementId: string;
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
    common: {
        isActive?: boolean;
        isDeleted?: boolean;
        isDefault?: boolean;

    }
}
