interface Supplier {
  _id: string;
  contactInformation: {
    primaryContactName: string;
    email?: string;
    phone?: string;
  };
}
export interface GoodsReceivedItem {
  productId: string;
  purchaseOrderItemId?: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  damageQuantity: number;
  unitPrice?: number;
  condition: "good" | "damaged" | "expired" | "other";
  notes?: string;
  _id?: string;
  supplier?: Supplier;
}

export interface IGoodsReceivedNote {
  _id: string;
  grnNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  receivedDate: Date;
  receivedBy: string;
  items: GoodsReceivedItem[];
  totalOrdered: number;
  totalReceived: number;
  totalAccepted: number;
  totalRejected: number;
  status: "draft" | "completed";
  notes?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}
