export interface IRegisterSharedInterface<TUserId = string> {
    userId?: TUserId;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    emailId: string;
    companyName: string;
    mobileNumber: string;
    phoneNumber: string;
    companyWebsite: string;
    companyAddress: string;
    country: string;
    zipCode: string;
    latitude: number;
    longitude: number; // ✅ fixed spelling
    password: string;
    confirmPassword: string;
    logo: string; // ✅ backend-safe
    termsSelected: boolean;
    isActive?: boolean;
    isDeleted?: boolean;
    isDefault?: boolean;
}
