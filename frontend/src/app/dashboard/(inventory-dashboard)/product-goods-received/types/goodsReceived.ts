// types/goodsReceived.ts

// ── Populated productId object (what the backend actually returns after populate)
export interface PopulatedProduct {
  _id: string;
  productName: string;
  sku: string;
  ui_price?: number;
  ui_totalStock?: number;
  id?: string;
}

// ── Single item inside a PurchaseOrder (matches real backend shape)
export interface PurchaseOrderItem {
  _id?: string;
  // productId is a populated object from the backend, not just a string
  productId: PopulatedProduct;
  quantity: number;
  unitPrice: number;
}

// ── Populated supplier shape (what the backend returns)
export interface Supplier {
  _id: string;
  contactInformation: {
    primaryContactName: string;
    emailAddress?: string;
    email?: string;
    phone?: string;
  };
  supplierIdentification?: {
    legalBusinessName?: string;
    tradingName?: string;
  };
  operationalInformation?: {
    orderContactEmail?: string;
    orderContactName?: string;
  };
}

// ── Full PurchaseOrder (matches real backend shape from document 6)
export interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  orderDate: Date | string;
  expectedDelivery: Date | string;
  status: "ordered" | "received" | "cancelled" | "pending" | "approved" | "draft";
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  supplier: Supplier;           // always populated from backend
}

// ── Item inside a GRN (what we store and display)
export interface GoodsReceivedNoteItem {
  _id?: string;
  purchaseOrderItemId: string;  // references PurchaseOrderItem._id (or productId._id as fallback)
  // We keep productId as the populated object so the dialog table can read from it
  productId?: any;
  // Flat copies for manual entries and display convenience
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  damageQuantity: number;
  unitPrice: number;
  condition: "good" | "damaged" | "defective" | "other";
  notes: string;
  status?: string;
}

export interface GoodsReceivedNote {
  _id: string;
  grnNumber: string;
  grnReference: string;
  purchaseOrderId: PurchaseOrder | string;
  supplier?: string;
  receivedDate: Date | string;
  receivedBy: string;
  items: GoodsReceivedNoteItem[];
  totalOrdered?: number;
  totalReceived?: number;
  totalAccepted?: number;
  totalRejected?: number;
  status: "received" | "ordered";
  notes?: string;
  signature?: string;
}

export interface GRNStats {
  totalGRNs: number;
  completedGRNs: number;
  discrepancyGRNs?: number;
  totalItemsReceived: number;
}

export interface NewProductForm {
  purchaseOrderItemId?: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  status: "received" | "ordered";
}