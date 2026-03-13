export type customerType = "domestic" | "corporate";
export interface BaseCustomerDto {
  userId: string;
  //personal information.
  person: { firstName: string; middleName?: string; lastName?: string };

  //contact information

  contact: { mobileNumber: string; phoneNumber?: string; emailId?: string };

  // addres
  address: {
    address: string;
    userId?: string;
    zipCode?: string;
    city?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
  };

  sourceId: string;

  isActive?: boolean;
  isDeleted?: boolean;
  isDefault?: boolean;
  isVatExemption?: boolean;
  vatExemptionReason?: string;
  customerType: customerType;
}

export interface DomesticCustomerDto extends BaseCustomerDto {
  customerType: "domestic";
}

export interface CorporateCutomerDto extends BaseCustomerDto {
  customerType: "corporate";
  companyName: string;
  registrationNo?: string;
  vatNo?: string;
  website?: string;
}

export type Customer = DomesticCustomerDto | CorporateCutomerDto;
