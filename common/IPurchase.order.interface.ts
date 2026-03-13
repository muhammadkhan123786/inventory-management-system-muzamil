import { IBaseEntity } from "./Base.Interface";

export interface IPurchaseOrderItem {
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderContactEmail?: string;
}

export interface IPurchaseOrder<TUserId = string> extends IBaseEntity<TUserId> {
  userId: TUserId;
  orderNumber: string;
  supplier: string;
  orderDate: Date;
  orderContactEmail: string;
  expectedDelivery: Date;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  items: IPurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
   isReorderPO?: boolean;
}

// DTO for creating purchase order
export interface CreatePurchaseOrderDTO {
  supplier: string;

  expectedDelivery: Date | string;
  items: IPurchaseOrderItem[];
  notes?: string;
  userId?: string;
  createdBy?: string;
  updatedBy?: string;
}

// DTO for updating purchase order
export interface UpdatePurchaseOrderDTO {
  supplier?: string;

  expectedDelivery?: Date | string;
  status?: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  items?: IPurchaseOrderItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  updatedBy?: string;
}

// Query filters
export interface PurchaseOrderFilters {
  userId?: string;
  status?: string;
  supplier?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}