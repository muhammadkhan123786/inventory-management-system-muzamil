import { basicCommonInfoDto } from "./profilecommonDto";
export interface VenderDto extends basicCommonInfoDto {
  userId: string;
  isActive?: boolean;
  isDeleted?: boolean;
  isDefault?: boolean;
  venderType: "Supplier" | "Vendor" | "Both";
  paymentTermId: string;
  currencyId?: string;
  credit_Limit?: number;
  bank_name?: string;
  account_Number?: string;
  lead_Time_Days?: number;
  business_name?: string;
  website?: string;
}
