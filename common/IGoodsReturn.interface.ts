// common/IGoodsReturn.interface.ts

export interface GRNForReturnItem {
  id: string;
  productName: string;
  sku: string;
  acceptedQuantity: number;
  alreadyReturnedQuantity?: number;
  unitPrice: number;
}

export interface GRNForReturn {
  id: string;
  grnNumber: string;
  poNumber: string;
  supplier: string;
  receivedDate: Date;
  items: GRNForReturnItem[];
}

export interface GoodsReturnNoteItem {
  id: string;
  productName: string;
  sku: string;
  receivedQuantity: number;
  returnQuantity: number;
  returnReason: string;
  condition: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface IGoodsReturnNote {
  _id: string;
  grnNumber: string;
  grnReference: string; // e.g. GRN-001 / PO-001
  returnNumber: string;
  supplier: string;
  returnDate: Date;
  returnedBy: string;
  status: "all" | "pending"| "approved" | "in-transit" | "completed" | "rejected";
  returnReason: string;
  items: GoodsReturnNoteItem[];
  totalAmount: number;
  notes?: string;
  createdAt?: Date;
}
