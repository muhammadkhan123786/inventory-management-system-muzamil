// ============================================================================
// CORE TYPES (from backend/common interfaces)
// ============================================================================

import { IBaseEntity } from "../../../../../../../common/Base.Interface";

/**
 * Purchase Order Item - represents a single line item in an order
 * productId is stored in DB; productName/sku are display-only on the frontend
 */
export interface IPurchaseOrderItem {
  productId: string;           // ← ADDED: stored in DB as ObjectId ref to Product
  productName: string;         // display only (not stored in DB)
  sku: string;                 // display only (not stored in DB)
  quantity: number;
  unitPrice: number;
  totalPrice: number;          // display only (computed, not stored in DB)
  orderContactEmail?: string;
  _id?: string;
}

/**
 * Purchase Order - main order entity
 */
export interface IPurchaseOrder<TUserId = string> extends IBaseEntity<TUserId> {
  orderNumber: string;
  supplier: string;
  orderDate: Date;
  expectedDelivery: Date;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  items: IPurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  orderContactEmail?: string;
}

/**
 * Supplier interface - matches backend structure
 */
export interface ISupplier {
  _id: string;
  legalBusinessName: string;
  email: string;
  phoneNumber: string;
  contactInformation: {
    contactInformation: string;
    emailAddress: string;
    primaryContactName: string;
  };
}

// ============================================================================
// DTO TYPES
// ============================================================================

export interface CreatePurchaseOrderDTO {
  orderNumber?: string;
  supplier: string;
  expectedDelivery: Date | string;
  items: IPurchaseOrderItem[];
  notes?: string;
  userId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UpdatePurchaseOrderDTO {
  supplier?: string;
  expectedDelivery?: Date | string;
  status?: IPurchaseOrder['status'];
  items?: IPurchaseOrderItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  updatedBy?: string;
}

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
  orderId?: string;
}

// ============================================================================
// FRONTEND-SPECIFIC TYPES
// ============================================================================

export interface IPurchaseOrderWithSupplier extends Omit<IPurchaseOrder, 'supplier'> {
  supplier: ISupplier;
}

export function isSupplierPopulated(
  order: IPurchaseOrder | IPurchaseOrderWithSupplier
): order is IPurchaseOrderWithSupplier {
  return typeof order.supplier === 'object' && order.supplier !== null;
}

export interface PurchaseOrderStats {
  totalOrders: number;
  pendingOrders: number;
  orderedCount: number;
  receivedCount: number;
}

export interface OrderFormData {
  supplier: string;
  orderContactEmail: string;
  expectedDelivery: string;
  notes: string;
}

/**
 * Form data for adding new items to an order
 * productId holds product._id — this is what gets saved to MongoDB
 */
export interface OrderItemForm {
  productId: string;    // ← KEPT: holds product._id for DB storage
  productName: string;  // display only
  sku: string;          // display only
  quantity: string;
  unitPrice: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PartialPurchaseOrder = Partial<Omit<IPurchaseOrder, '_id'>> & {
  _id: string;
};

export type OrderStatus = IPurchaseOrder['status'];

export const ORDER_STATUSES: OrderStatus[] = [
  'draft',
  'pending',
  'approved',
  'ordered',
  'received',
  'cancelled'
];

export const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft:     { label: 'Draft',     color: 'text-gray-700',   bgColor: 'bg-gray-100'   },
  pending:   { label: 'Pending',   color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  approved:  { label: 'Approved',  color: 'text-blue-700',   bgColor: 'bg-blue-100'   },
  ordered:   { label: 'Ordered',   color: 'text-purple-700', bgColor: 'bg-purple-100' },
  received:  { label: 'Received',  color: 'text-green-700',  bgColor: 'bg-green-100'  },
  cancelled: { label: 'Cancelled', color: 'text-red-700',    bgColor: 'bg-red-100'    },
};

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

/**
 * Convert form data + items → create DTO sent to backend.
 *
 * FIX: items are now mapped to { productId, quantity, unitPrice } which
 * matches the Zod schema:
 *   purchaseOrderItemZodSchema = z.object({
 *     productId: z.string(),
 *     quantity:  z.number().min(1),
 *     unitPrice: z.number().nonnegative(),
 *   })
 */
export function formDataToCreateDTO(
  formData: OrderFormData,
  items: IPurchaseOrderItem[],
  orderNumber?: string
): Partial<IPurchaseOrder> {
  return {
    orderNumber,
    supplier: formData.supplier,
    orderContactEmail: formData.orderContactEmail,
    expectedDelivery: new Date(formData.expectedDelivery),
    notes: formData.notes || undefined,
    // ↓ Only send what the backend Zod schema requires for each item
    items: items.map((item) => ({
      productId: item.productId,   // ← FIX: was missing → caused "received undefined"
      quantity:  item.quantity,
      unitPrice: item.unitPrice,   // ← FIX: was `price` in old version; Zod expects `unitPrice`
      // productName / sku / totalPrice are NOT sent — backend doesn't want them
    })) as unknown as IPurchaseOrderItem[],
  };
}

/**
 * Convert item form row → IPurchaseOrderItem (used in the frontend list).
 * productId is carried through so formDataToCreateDTO can access it later.
 */
export function itemFormToOrderItem(itemForm: OrderItemForm): IPurchaseOrderItem {
  const quantity  = parseInt(itemForm.quantity,  10);
  const unitPrice = parseFloat(itemForm.unitPrice);

  return {
    productId:   itemForm.productId,           // ← FIX: must be mapped here
    productName: itemForm.productName.trim(),   // display only
    sku:         itemForm.sku.trim(),           // display only
    quantity,
    unitPrice,
    totalPrice:  quantity * unitPrice,          // display only
  };
}

/**
 * Convert purchase order → form data (for the edit flow)
 */
export function orderToFormData(
  order: IPurchaseOrder | IPurchaseOrderWithSupplier
): OrderFormData {
  return {
    supplier: isSupplierPopulated(order) ? order.supplier._id : order.supplier,
    orderContactEmail: order.orderContactEmail || '',
    expectedDelivery: new Date(order.expectedDelivery).toISOString().split('T')[0],
    notes: order.notes || '',
  };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateOrderForm(formData: OrderFormData): string[] {
  const errors: string[] = [];
  if (!formData.supplier)         errors.push('Supplier is required');
  if (!formData.expectedDelivery) errors.push('Expected delivery date is required');
  return errors;
}

export function validateOrderItems(items: IPurchaseOrderItem[]): string[] {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push('At least one item is required');
  }

  items.forEach((item, index) => {
    if (!item.productId)   errors.push(`Item ${index + 1}: Product must be selected from the list`);
    if (!item.productName) errors.push(`Item ${index + 1}: Product name is required`);
    if (!item.sku)         errors.push(`Item ${index + 1}: SKU is required`);
    if (item.quantity  <= 0) errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    if (item.unitPrice <= 0) errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
  });

  return errors;
}

/**
 * Validate item form before adding to the list.
 * Checks productId first — if user typed a name but didn't pick from the
 * dropdown, productId will be "" and we catch it here with a clear message.
 */
export function validateItemForm(itemForm: OrderItemForm): string | null {
  // ← FIX: this check was missing entirely in the old version
  if (!itemForm.productId)
    return 'Please select a product from the dropdown (do not type manually)';

  if (!itemForm.productName) return 'Product name is required';
  if (!itemForm.sku)         return 'SKU is required';

  const quantity = parseInt(itemForm.quantity, 10);
  if (isNaN(quantity) || quantity <= 0)
    return 'Quantity must be a number greater than 0';

  const unitPrice = parseFloat(itemForm.unitPrice);
  if (isNaN(unitPrice) || unitPrice <= 0)
    return 'Unit price must be a number greater than 0';

  return null;
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export function calculateOrderTotals(
  items: IPurchaseOrderItem[],
  taxRate: number = 0
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax      = subtotal * (taxRate / 100);
  const total    = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax:      Math.round(tax      * 100) / 100,
    total:    Math.round(total    * 100) / 100,
  };
}