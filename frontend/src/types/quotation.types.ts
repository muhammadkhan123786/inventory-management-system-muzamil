import { IBaseEntity } from "../../../common/Base.Interface";

// Explicitly define quotation with string IDs for frontend use
export interface IQuotationWithId extends IBaseEntity<string> {
  _id: string;
  ticketId: string;
  quotationStatusId: string;
  partsList?: string[];
  labourTime?: number;
  labourRate?: number;
  aditionalNotes?: string;
  validityDate?: string;
  technicianId: string;
  partTotalBill?: number;
  labourTotalBill?: number;
  subTotalBill?: number;
  taxAmount?: number;
  netTotal?: number;
  quotationAutoId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IQuotationStatus {
  _id: string;
  ticketQuationStatus: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface IQuotationListResponse {
  data: IQuotationWithId[];
  total: number;
  page: number;
  limit: number;
}

export interface IQuotationStatusCount {
  status: string;
  count: number;
  statusId: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
}
