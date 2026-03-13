"use client";

import { motion }        from "framer-motion";
import { Button }        from "@/components/form/CustomButton";
import { Badge }         from "@/components/form/Badge";
import { GoodsReceivedNote, PurchaseOrder } from "../types/goodsReceived";
import { getStatusColor, getDeliveryStatusBadge, getDeliveryStatusColor } from "../utils/goodsReceivedUtils";
import { Calendar, User, Eye, Download,
         CheckCircle, Clock, Package } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

// ── ✅ Static icon — no dynamic component ────────────────────────────────────
const StatusIconInline = ({ status }: { status: string }) => {
  switch (status) {
    case "received": return <CheckCircle className="h-3 w-3 mr-1" />;
    case "ordered":  return <Package     className="h-3 w-3 mr-1" />;
    default:         return <Clock       className="h-3 w-3 mr-1" />;
  }
};

// ── Item totals ───────────────────────────────────────────────────────────────
const useItemTotals = (items: GoodsReceivedNote["items"]) =>
  React.useMemo(() => items.reduce(
    (acc, item) => {
      acc.ordered  += Number(item.orderedQuantity)  || 0;
      acc.received += Number(item.receivedQuantity) || 0;
      acc.accepted += Number(item.acceptedQuantity) || 0;
      acc.rejected += Number(item.rejectedQuantity) || 0;
      acc.damaged  += Number(item.damageQuantity)   || 0;
      return acc;
    },
    { ordered: 0, received: 0, accepted: 0, rejected: 0, damaged: 0 }
  ), [items]);

// ────────────────────────────────────────────────────────────────────────────
interface GRNRowProps {
  grn:         GoodsReceivedNote;
  index:       number;
  onView:      (grn: GoodsReceivedNote) => void;
  onDownload?: (grn: GoodsReceivedNote) => void;
}

export const GRNRow: React.FC<GRNRowProps> = ({ grn, index, onView, onDownload }) => {
  const po             = grn.purchaseOrderId as PurchaseOrder;
  const totals         = useItemTotals(grn.items);
  const deliveryStatus = getDeliveryStatusBadge(grn);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
    >
      {/* GRN # */}
      <td className="p-4">
        <span className="text-sm font-mono px-3 py-1.5 rounded-lg text-gray-700 font-semibold bg-gradient-to-r from-blue-100 to-cyan-100">
          {grn.grnNumber}
        </span>
      </td>

      {/* PO # */}
      <td className="p-4">
        <span className="text-sm font-mono px-3 py-1.5 rounded-lg text-gray-700 font-semibold bg-gradient-to-r from-emerald-100 to-teal-100">
          {po?.orderNumber ?? "—"}
        </span>
      </td>

      {/* Supplier */}
      <td className="p-4">
        <p className="font-medium text-gray-900">
          {po?.supplier?.contactInformation?.primaryContactName ?? "—"}
        </p>
        <p className="text-xs text-gray-500">
          {po?.supplier?.contactInformation?.emailAddress ?? ""}
        </p>
      </td>

      {/* Received Date */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm">
            {grn.receivedDate
              ? new Date(grn.receivedDate).toLocaleDateString("en-GB")
              : po?.expectedDelivery
              ? new Date(po.expectedDelivery).toLocaleDateString("en-GB")
              : "—"}
          </span>
        </div>
      </td>

      {/* Received By */}
      <td className="p-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-gray-700 text-sm">{grn.receivedBy ?? "—"}</span>
        </div>
      </td>

      {/* Items ─────────────────────────────────────────────────────────────
          Badge:  X items
          Line 1: ✓ Y accepted / Z ordered
          Line 2: ✗ rejected  ⚠ damaged  (only if > 0)
      ───────────────────────────────────────────────────────────────────── */}
      <td className="p-4">
        <div className="space-y-1">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {grn.items.length} item{grn.items.length !== 1 ? "s" : ""}
          </Badge>

          <p className="text-xs">
            <span className="text-green-600 font-medium">✓ {totals.accepted} accepted</span>
            {totals.ordered > 0 && (
              <span className="text-gray-400"> / {totals.ordered} ordered</span>
            )}
          </p>

          {(totals.rejected > 0 || totals.damaged > 0) && (
            <p className="text-xs flex gap-2">
              {totals.rejected > 0 && (
                <span className="text-red-500 font-medium">✗ {totals.rejected} rejected</span>
              )}
              {totals.damaged > 0 && (
                <span className="text-orange-500 font-medium">⚠ {totals.damaged} damaged</span>
              )}
            </p>
          )}
        </div>
      </td>

      {/* Delivery Status ────────────────────────────────────────────────────
          AUTO-CALCULATED from item counts — never manual
          Priority: Rejections > Pending > Fully/Partially Delivered
      ───────────────────────────────────────────────────────────────────── */}
      <td className="p-4">
        <Badge className={getDeliveryStatusColor(deliveryStatus)}>
          {deliveryStatus}
        </Badge>
      </td>

      {/* GRN Status ─────────────────────────────────────────────────────────
          "ordered"  = GRN created but stock not yet confirmed
          "received" = stock updated ✅ (set automatically by backend)
          NO manual change — set by applyGRNToStock() service
      ───────────────────────────────────────────────────────────────────── */}
      <td className="p-4">
        <Badge className={cn(
          "text-white border-0 shadow-sm flex items-center w-fit gap-0.5",
          `bg-gradient-to-r ${getStatusColor(grn.status)}`
        )}>
          <StatusIconInline status={grn.status} />
          <span className="capitalize">{grn.status}</span>
        </Badge>
      </td>

      {/* Actions */}
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(grn)}
            className="hover:bg-blue-50" title="View GRN">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDownload?.(grn)}
            className="hover:bg-emerald-50" title="Download PDF">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
};