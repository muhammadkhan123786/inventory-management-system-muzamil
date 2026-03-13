// import { GoodsReceivedNote } from '../types/goodsReceived';
// import { FileText, CheckCircle2, AlertTriangle, LucideIcon } from 'lucide-react';

// export const getStatusColor = (status: string): string => {
//   switch (status) {
//     case 'draft': return 'from-gray-500 to-gray-600';
//     case 'completed': return 'from-green-500 to-emerald-500';
//     case 'discrepancy': return 'from-orange-500 to-amber-500';
//     default: return 'from-gray-500 to-gray-600';
//   }
// };

// export const getStatusIcon = (status: string): LucideIcon => {
//   switch (status) {
//     case 'draft': return FileText;
//     case 'completed': return CheckCircle2;
//     case 'discrepancy': return AlertTriangle;
//     default: return FileText;
//   }
// };

// export const getDeliveryStatusBadge = (grn: GoodsReceivedNote) => {
//   const totalReceived = grn.totalReceived ?? 0;
//   const totalOrdered = grn.totalOrdered ?? 0;
//   const totalRejected = grn.totalRejected ?? 0;

//   if (totalReceived === totalOrdered && totalRejected === 0) {
//     return 'Fully Delivered';
//   } else if (totalReceived < totalOrdered) {
//     return 'Partially Delivered';
//   } else if (totalRejected > 0) {
//     return 'With Rejections';
//   }

//   return 'Received';
// };


// utils/goodsReceivedUtils.ts
import { GoodsReceivedNote } from "../types/goodsReceived";

// ── Status gradient colors ────────────────────────────────────────────────
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "received": return "from-green-500 to-emerald-500";
    case "ordered":  return "from-blue-500  to-cyan-500";
    case "partial":  return "from-orange-500 to-amber-500";
    default:         return "from-gray-400  to-gray-500";
  }
};

// ── Delivery Status Logic — FIXED ────────────────────────────────────────────
//
// PRIORITY ORDER (top wins):
//
// 1. rejected > 0 OR damaged > 0          → "With Rejections"  🔴
//    (even if accepted = 0)
//
// 2. accepted = 0 AND received = 0        → "Pending"          🔵
//    (nothing came in at all)
//
// 3. orderedQty available:
//    accepted >= ordered                  → "Fully Delivered"   🟢
//    accepted > 0 but < ordered           → "Partially Delivered" 🟠
//
// 4. orderedQty NOT available (= 0):
//    accepted = received (no waste)       → "Fully Delivered"   🟢
//    accepted < received                  → "Partially Delivered" 🟠
//
// WHY THE BUG HAPPENED:
//   orderedQuantity was 0 on GRN items (not copied from PO)
//   So: accepted(0) >= ordered(0) = TRUE → wrongly "Fully Delivered"
//   FIX: rejection/damage check ALWAYS runs first, regardless of other values
//
export const getDeliveryStatusBadge = (grn: GoodsReceivedNote): string => {
  const items = grn.items ?? [];
  if (items.length === 0) return "Pending";

  let totalOrdered  = 0;
  let totalReceived = 0;
  let totalAccepted = 0;
  let totalRejected = 0;
  let totalDamaged  = 0;

  for (const item of items) {
    totalOrdered  += Number(item.orderedQuantity)  || 0;
    totalReceived += Number(item.receivedQuantity) || 0;
    totalAccepted += Number(item.acceptedQuantity) || 0;
    totalRejected += Number(item.rejectedQuantity) || 0;
    totalDamaged  += Number(item.damageQuantity)   || 0;
  }

  // ── RULE 1: Any rejection or damage → always "With Rejections" ──────────
  // This fires even if accepted = 0
  if (totalRejected > 0 || totalDamaged > 0) {
    return "With Rejections";
  }

  // ── RULE 2: Nothing received at all ─────────────────────────────────────
  if (totalReceived === 0 && totalAccepted === 0) {
    return "Pending";
  }

  // ── RULE 3: orderedQuantity is available (copied from PO) ───────────────
  if (totalOrdered > 0) {
    return totalAccepted >= totalOrdered ? "Fully Delivered" : "Partially Delivered";
  }

  // ── RULE 4: orderedQuantity not on GRN — use received as baseline ────────
  // If everything received was accepted → fully done
  if (totalReceived > 0) {
    return totalAccepted >= totalReceived ? "Fully Delivered" : "Partially Delivered";
  }

  // ── Fallback ─────────────────────────────────────────────────────────────
  return totalAccepted > 0 ? "Fully Delivered" : "Pending";
};

// ── Delivery status badge color ──────────────────────────────────────────────
export const getDeliveryStatusColor = (status: string): string => {
  switch (status) {
    case "Fully Delivered":     return "bg-green-100  text-green-700  border-green-200";
    case "Partially Delivered": return "bg-orange-100 text-orange-700 border-orange-200";
    case "With Rejections":     return "bg-red-100    text-red-700    border-red-200";
    case "Pending":             return "bg-blue-100   text-blue-700   border-blue-200";
    default:                    return "bg-gray-100   text-gray-500   border-gray-200";
  }
};
