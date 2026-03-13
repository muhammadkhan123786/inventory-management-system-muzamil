export interface basicCommonInfoDto {
  //personal information.
  person: {
    firstName: string;
    middleName?: string;
    lastName?: string;
  };

  //contact information
  contact: {
    mobileNumber: string;
    phoneNumber?: string;
    emailId: string;
  };
  // addres
  address: {
    address: string;
    zipCode?: string;
    city?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    userId?: string;
  };
}
export interface commonProfileDto extends basicCommonInfoDto {
  isActive?: boolean;
  isDeleted?: boolean;
  isDefault?: boolean;
  role?: "Admin" | "Technician" | "Customer";
}
