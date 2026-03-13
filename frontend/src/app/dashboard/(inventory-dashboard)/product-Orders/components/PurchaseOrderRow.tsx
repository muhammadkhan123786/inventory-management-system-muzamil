'use client';

import { motion }                    from 'framer-motion';
import { Button }                    from '@/components/form/CustomButton';
import { Badge }                     from '@/components/form/Badge';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/form/Select';
import { IPurchaseOrder, ISupplier } from '../types/purchaseOrders';
import {
  Calendar, Truck, Eye, Edit, Trash2,
  FileEdit, ShoppingCart, PackageCheck,
  XCircle, Clock,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// PO STATUS — 3 manual + 1 auto
//
//  draft      → PO just created
//  ordered    → AUTO set by email middleware (POST /purchase-orders)
//  received   → AUTO set by GRN stock service (when fully received)
//  cancelled  → MANUAL only — supplier ko email jata hai
//
// Dropdown shows ONLY "Cancel Order" for both draft and ordered
// "ordered" and "received" are never manually selectable
// ─────────────────────────────────────────────────────────────────────────────

// ── Static status icon (never dynamic — React crash prevention) ──────────────
const StatusIconInline = ({ status }: { status: string }) => {
  switch (status) {
    case 'draft':     return <FileEdit     className="h-3.5 w-3.5" />;
    case 'ordered':   return <ShoppingCart className="h-3.5 w-3.5" />;
    case 'received':  return <PackageCheck className="h-3.5 w-3.5" />;
    case 'cancelled': return <XCircle      className="h-3.5 w-3.5" />;
    default:          return <Clock        className="h-3.5 w-3.5" />;
  }
};

// ── PO Status badge styles ────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-slate-100  text-slate-600  border-slate-200',
  ordered:   'bg-blue-100   text-blue-700   border-blue-200',
  received:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50     text-red-500    border-red-200',
};

// ── Delivery Status Badge — from expected delivery date ───────────────────────
const DeliveryStatusBadge = ({ order }: { order: IPurchaseOrder }) => {
  if (order.status === 'received') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
        <PackageCheck className="h-3 w-3" /> Delivered
      </span>
    );
  }
  if (order.status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-400 border-red-200">
        <XCircle className="h-3 w-3" /> Cancelled
      </span>
    );
  }
  if (order.status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-100 text-slate-400 border-slate-200">
        <Clock className="h-3 w-3" /> Not Ordered
      </span>
    );
  }

  // ordered → check expected delivery date
  const today    = new Date();
  const delivery = new Date(order.expectedDelivery as any);
  const diffDays = Math.ceil(
    (delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0)  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-600 border-red-200">
      <Clock className="h-3 w-3" /> Overdue {Math.abs(diffDays)}d
    </span>
  );
  if (diffDays === 0) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-orange-50 text-orange-600 border-orange-200">
      <Truck className="h-3 w-3" /> Due Today
    </span>
  );
  if (diffDays <= 3)  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-600 border-yellow-200">
      <Truck className="h-3 w-3" /> Due in {diffDays}d
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-600 border-blue-200">
      <Truck className="h-3 w-3" /> In {diffDays} days
    </span>
  );
};

// ── Supplier guard ────────────────────────────────────────────────────────────
const isSupplierObject = (s: string | ISupplier): s is ISupplier =>
  typeof s === 'object' && s !== null;

// ─────────────────────────────────────────────────────────────────────────────
// ALLOWED TRANSITIONS
//  draft    → cancelled  (manual — email to supplier)
//  ordered  → cancelled  (manual — email to supplier)
//  received → []         terminal AUTO
//  cancelled→ []         terminal
// ─────────────────────────────────────────────────────────────────────────────
const CAN_CANCEL = ['draft', 'ordered'];   // these two show Cancel dropdown
const IS_TERMINAL = ['received', 'cancelled'];

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface PurchaseOrderRowProps {
  order:          IPurchaseOrder;
  index:          number;
  onView:         (order: IPurchaseOrder) => void;
  onEdit:         (order: IPurchaseOrder) => void;
  onDelete:       (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: IPurchaseOrder['status']) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const PurchaseOrderRow: React.FC<PurchaseOrderRowProps> = ({
  order, index, onView, onEdit, onDelete, onStatusChange,
}) => {
  const canCancel  = CAN_CANCEL.includes(order.status);
  const isTerminal = IS_TERMINAL.includes(order.status);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.2 }}
      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-emerald-50/40 hover:to-teal-50/40 transition-colors duration-200"
    >

      {/* Order Number */}
      <td className="p-4 whitespace-nowrap">
        <span className="inline-flex items-center text-sm font-mono font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-100">
          {order.orderNumber}
        </span>
      </td>

      {/* Supplier */}
      <td className="p-4">
        {isSupplierObject(order.supplier) ? (
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">
              {order.supplier.contactInformation?.primaryContactName ?? '—'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.supplier.contactInformation?.emailAddress ?? '—'}
            </p>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Supplier ID only</span>
        )}
      </td>

      {/* Order Date */}
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          {new Date(order.orderDate as any).toLocaleDateString('en-GB')}
        </div>
      </td>

      {/* Expected Delivery */}
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Truck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          {new Date(order.expectedDelivery as any).toLocaleDateString('en-GB')}
        </div>
      </td>

      {/* Items */}
      <td className="p-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </span>
      </td>

      {/* Total */}
      <td className="p-4 whitespace-nowrap">
        <span className="text-base font-bold text-emerald-600">
          £{Number(order.total).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
        </span>
      </td>

      {/* Delivery Status */}
      <td className="p-4">
        <DeliveryStatusBadge order={order} />
      </td>

      {/* PO Status */}
      <td className="p-4">
        {isTerminal ? (
          // received / cancelled → static badge only
          <span className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            STATUS_STYLES[order.status],
          )}>
            <StatusIconInline status={order.status} />
            <span className="capitalize">{order.status}</span>
          </span>

        ) : canCancel ? (
          // draft / ordered → dropdown with Cancel only
          <Select
            value={order.status}
            onValueChange={(val) =>
              onStatusChange(order._id!, val as IPurchaseOrder['status'])
            }
          >
            <SelectTrigger className={cn(
              'w-36 text-sm font-medium border rounded-full px-3 shadow-none',
              STATUS_STYLES[order.status],
            )}>
              <div className="flex items-center gap-1.5">
                <StatusIconInline status={order.status} />
                <SelectValue />
              </div>
            </SelectTrigger>

            <SelectContent className="min-w-[180px]">
              {/* Current — read only */}
              <SelectItem value={order.status} disabled className="text-gray-400 text-xs">
                <span className="capitalize">{order.status}</span> (current)
              </SelectItem>

              <div className="border-t border-gray-100 my-1" />

              {/* Only manual action allowed = Cancel */}
              <SelectItem value="cancelled" className="text-red-600 text-sm font-medium">
                <span className="flex items-center gap-2">
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Order
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

        ) : null}
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-center gap-1">

          <Button size="sm" variant="ghost"
            onClick={() => onView(order)}
            className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            title="View Details">
            <Eye className="h-4 w-4" />
          </Button>

          {/* Edit — draft only (ordered = placed, cannot edit) */}
          <Button size="sm" variant="ghost"
            onClick={() => onEdit(order)}
            className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
            title={order.status === 'draft' ? 'Edit Order' : 'Order already placed — cannot edit'}
            // disabled={order.status !== 'draft'}
            >
            <Edit className="h-4 w-4" />
          </Button>

          {/* Delete — draft or cancelled only */}
          <Button size="sm" variant="ghost"
            onClick={() => onDelete(order._id!)}
            className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600"
            title={['draft','cancelled'].includes(order.status) ? 'Delete' : 'Cannot delete active order'}
            // disabled={!['draft', 'cancelled'].includes(order.status)}
            
            >
            <Trash2 className="h-4 w-4" />
          </Button>

        </div>
      </td>

    </motion.tr>
  );
};