// export interface GoodsReturnNoteItem {
//   id: string;
//   productName: string;
//   sku: string;
//   receivedQuantity: number;
//   returnQuantity: number;
//   returnReason: 'damaged' | 'defective' | 'wrong-item' | 'excess' | 'quality-issue' | 'other';
//   condition: string;
//   unitPrice: number;
//   totalPrice: number;
//   notes: string;
//   _id?: string;
// }

// export interface PurchaseOrderItem {
//   _id: string;
//   productName: string;
//   sku: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;

// }

// export interface GRNItem {
//   receivedQuantity: number;
//   acceptedQuantity?: number;
//   rejectedQuantity?: number;
//   damageQuantity?: number;
//   unitPrice: number;
//   condition?: string;
//   notes?: string;
// }

// export interface GRN {
//   _id: string;
//   grnNumber?: string;
//   purchaseOrderId?: PurchaseOrder;
//   items: GRNItem[];
// }

// export interface ReturnItem {
//   returnQty: number;
//   totalAmount: number;
//   status?: any;
//   itemsNotes?: string;
// }

// export interface PurchaseOrder {
//   _id: string;
//   supplier?: {
//     contactInformation?: {
//       primaryContactName?: string;
//     };
//   };
//   orderNumber?: string;
//   items: PurchaseOrderItem[];
// }


// export interface GoodsReturnNote {
//   _id: string;
//   grtnNumber?: string;
//   returnNumber?: string;

//   grnNumber?: string;
//   grnId?: GRN;

//   supplier?: string;

//   returnDate: Date;
//   returnedBy: string;

//   status: 'pending' | 'approved' | 'in-transit' | 'completed' | 'rejected';
//   returnReason: string;

//   items: ReturnItem[];
//   totalAmount?: number;
//   notes?: string;

//   createdAt: Date;
// }

// export interface GRNForReturn {
//   id: string;
//   grnNumber: string;
//   poNumber: string;
//    purchaseOrderId?: {
//     supplier?: {
//       contactInformation?: {
//         primaryContactName?: string;
//       };
//     };
//   };
//   createdAt: Date;
//   supplier: string;
//   receivedDate: Date;
//   items: Array<{
//     id: string;
//     productName: string;
//     sku: string;
//     receivedQuantity: number;
//     acceptedQuantity: number;
//     unitPrice: number;
//   }>;
// }

// export interface ReturningItem {
//   _id: string;
//   productName: string;
//   productId: string;
//   sku: string;
//   receivedQuantity: number;
//   returnQuantity: number;
//   returnReason: 'damaged' | 'defective' | 'wrong-item' | 'excess' | 'quality-issue' | 'other';
//   condition: string;
//   notes: string;
//   unitPrice: number;
// }

// export interface ReturnStats {
//   totalReturns: number;
//   pendingReturns: number;
//   inTransitReturns: number;
//   completedReturns: number;
//   totalReturnValue: number;
// }


// export interface CreateGoodsReturnItemDto {
//   returnQty: number;
//   totalAmount: number;
//   itemsNotes?: string;
// }

// export interface CreateGoodsReturnDto {
//   grnId: string;
//   returnedBy: string;
//   returnReason: string;
//   notes?: string;
//   items: CreateGoodsReturnItemDto[];
//   returnDate: Date;
//   grtnNumber: string;
// }


// types/goodsReturn.ts

// ── Single item being returned ────────────────────────────────────────────
export interface ReturningItem {
  _id:              string;
  productId:        string;   // ✅ Added — required for stock trace
  productName:      string;
  sku:              string;
  receivedQuantity: number;
  returnQuantity:   number;
  returnReason:     string;
  condition:        string;
  notes:            string;
  unitPrice:        number;
  acceptedQuantity: number;
}

// ── GRN item shape coming from backend ───────────────────────────────────
export interface GRNItem {
  _id?:             string;
  id?:              string;
  productId:        string;   // ✅ ObjectId string
  productName:      string;
  sku:              string;
  acceptedQuantity: number;
  receivedQuantity: number;
  rejectedQuantity: number;
  damageQuantity:   number;
  unitPrice:        number;
  condition:        string;
  notes:            string;
}

// ── GRN shape for the dropdown ────────────────────────────────────────────
export interface GRNForReturn {
  id:              string;
  _id?:            string;
  grnNumber:       string;
  createdAt:       string;
  items:           GRNItem[];
  purchaseOrderId?: {
    supplier?: {
      contactInformation?: {
        primaryContactName?: string;
      };
    };
  };
}

// ── Single item inside a saved GoodsReturn ────────────────────────────────
export interface GoodsReturnItem {
  productId:   string;
  productName: string;
  sku:         string;
  returnQty:   number;
  totalAmount: number;
  unitPrice:   number;
  itemsNotes:  string;
  status:      ReturnItemStatus;
}

export type ReturnItemStatus =
  | "pending"
  | "approved"
  | "in-transit"
  | "completed"
  | "rejected";

export type ReturnStatus =
  | "pending"
  | "approved"
  | "in-transit"
  | "completed"
  | "rejected";

// ── Full GoodsReturn document ─────────────────────────────────────────────
export interface GoodsReturnNote {
  _id:             string;
  grtnNumber?:     string;
  returnNumber?:   string;
  returnReference: string;
  grnId:           string | { _id: string; grnNumber: string };
  returnedBy:      string;
  returnReason:    string;
  returnDate:      string | Date;
  items:           GoodsReturnItem[];
  notes:           string;
  status:          ReturnStatus;
  totalAmount?:    number;
  createdAt:       string;
  updatedAt:       string;
  data: any
}

// ── DTO sent to backend on create ─────────────────────────────────────────
export interface CreateGoodsReturnDto {
  grnId:        string;
  returnedBy:   string;
  returnReason: string;
  returnDate:   Date;
  notes?:       string;
  items: {
    productId:   string;   // ✅ Required
    sku:         string;   // ✅ Required
    productName: string;
    returnQty:   number;
    totalAmount: number;
    unitPrice:   number;
    itemsNotes?: string;
  }[];
}

// ── Stats ─────────────────────────────────────────────────────────────────
// export interface ReturnStats {
//   totalReturns:     number;
//   pendingReturns:   number;
//   inTransitReturns: number;
//   completedReturns: number;
//   totalReturnValue: number;
// }

export interface ReturnStats {
  totalReturns: number;
  completed:    number;
  pending:      number;
  rejected:     number;
  totalValue:   number;
}
