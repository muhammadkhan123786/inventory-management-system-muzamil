'use client';

import { motion }       from 'framer-motion';
import { Card, CardContent } from '@/components/form/Card';
import { Button }       from '@/components/form/CustomButton';
import { Badge }        from '@/components/form/Badge';
import { GoodsReturnNote, ReturnStatus } from '../types/goodsReturn';
import { getStatusColor } from '../utils/goodsReturnUtils';
import {
  FileText, Truck, Calendar, User, Eye, Download,
  PackageX, Package, Clock, CheckCircle, XCircle,
  ChevronRight, Loader2
} from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface GoodsReturnTableViewProps {
  returns:          GoodsReturnNote[];
  onView:           (grtn: GoodsReturnNote) => void;
  onDownload?:      (grtn: GoodsReturnNote) => void;
  onStatusUpdate:   (id: string, status: ReturnStatus) => void;
  isUpdatingStatus: string | null;
}

// ── Static status icon (no dynamic component — avoids React crash) ─────────
const StatusIconInline = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':    return <Clock        className="h-5 w-5 text-white" />;
    case 'approved':   return <CheckCircle  className="h-5 w-5 text-white" />;
    case 'in-transit': return <Truck        className="h-5 w-5 text-white" />;
    case 'completed':  return <CheckCircle  className="h-5 w-5 text-white" />;
    case 'rejected':   return <XCircle      className="h-5 w-5 text-white" />;
    default:           return <Package      className="h-5 w-5 text-white" />;
  }
};

// ── Next allowed status per current status ─────────────────────────────────
const NEXT_STATUSES: Record<string, { status: ReturnStatus; label: string; color: string }[]> = {
  pending:    [
    { status: 'approved',   label: '✅ Approve',        color: 'bg-green-500 hover:bg-green-600' },
    { status: 'rejected',   label: '❌ Reject',         color: 'bg-red-500   hover:bg-red-600'   },
  ],
  approved:   [
    { status: 'in-transit', label: '🚚 Mark Dispatched', color: 'bg-blue-500  hover:bg-blue-600'  },
    { status: 'rejected',   label: '❌ Reject',          color: 'bg-red-500   hover:bg-red-600'   },
  ],
  'in-transit': [
    { status: 'completed',  label: '✅ Mark Completed',  color: 'bg-green-500 hover:bg-green-600' },
    { status: 'rejected',   label: '❌ Reject',          color: 'bg-red-500   hover:bg-red-600'   },
  ],
  completed:  [],   // terminal
  rejected:   [],   // terminal
};

// ── Status label display ───────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending:      'Pending',
  approved:     'Approved',
  'in-transit': 'In Transit',
  completed:    'Completed',
  rejected:     'Rejected',
};

export const GoodsReturnTableView: React.FC<GoodsReturnTableViewProps> = ({
  returns, onView, onDownload, onStatusUpdate, isUpdatingStatus,
}) => {

  if (returns.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <PackageX className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Return Notes Found</h3>
          <p className="text-gray-500">No goods return notes match your search criteria</p>
        </CardContent>
      </Card>
    );
  }
  console.log("This is the InCorrect Project log", returns);

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Return #</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">GRN / PO</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Supplier</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Return Date</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Returned By</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Total Value</th>
                {/* ✅ NEW column */}
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-900">Next Action</th>
                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {returns.map((grtn, index) => {
                const nextOptions  = NEXT_STATUSES[grtn.status] || [];
                const isUpdating   = isUpdatingStatus === grtn._id;
                const isTerminal   = nextOptions.length === 0;

                const totalAmount = grtn.totalAmount ||
                  grtn.items.reduce((s, i) => s + (i.totalAmount || 0), 0);

                const grnNumber  = (grtn.grnId as any)?.grnNumber ||  '—';
                const grtnNumber = grtn.grtnNumber || grtn.returnNumber || '—';
                const supplier   = (grtn.grnId as any)
                  ?.purchaseOrderId?.supplier?.contactInformation?.primaryContactName || '—';

                return (
                  <motion.tr
                    key={grtn._id!}
                    initial={{ opacity:0, x:-20 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay: 0.05 * index }}
                    className="hover:bg-orange-50/40 transition-colors"
                  >

                    {/* Return Number */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          `bg-gradient-to-br ${getStatusColor(grtn.status)}`
                        )}>
                          <StatusIconInline status={grtn.status} />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{grtnNumber}</span>
                      </div>
                    </td>

                    {/* GRN / PO */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900">{grnNumber}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Package className="h-3 w-3 text-blue-400 flex-shrink-0" />
                          <span>{grtnNumber}</span>
                        </div>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Truck className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                        <span className="text-gray-700 max-w-[160px] truncate">{supplier}</span>
                      </div>
                    </td>

                    {/* Return Date */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                        {new Date(grtn.returnDate).toLocaleDateString('en-GB', {
                          day:'2-digit', month:'short', year:'numeric'
                        })}
                      </div>
                    </td>

                    {/* Returned By */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                        {grtn.returnedBy || '—'}
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-5 py-4">
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                        {grtn.items.length} item(s)
                      </Badge>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4">
                      <Badge className={cn(
                        "text-white border-0 text-xs",
                        `bg-gradient-to-r ${getStatusColor(grtn.status)}`
                      )}>
                        {STATUS_LABELS[grtn.status] || grtn.status}
                      </Badge>
                    </td>

                    {/* Total Value */}
                    <td className="px-5 py-4">
                      <span className="text-base font-bold text-orange-600">
                        £{totalAmount.toFixed(2)}
                      </span>
                    </td>

                    {/* ✅ Next Action — manager clicks here to move status */}
                    <td className="px-5 py-4">
                      {isUpdating ? (
                        // Loading spinner while updating
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </div>
                      ) : isTerminal ? (
                        // Terminal state — no further action
                        <span className="text-xs text-gray-400 italic">
                          {grtn.status === 'completed' ? '✅ Done' : '❌ Closed'}
                        </span>
                      ) : (
                        // Action buttons
                        <div className="flex flex-col gap-1.5">
                          {nextOptions.map(({ status, label, color }) => (
                            <button
                              key={status}
                              onClick={() => onStatusUpdate(grtn._id!, status)}
                              disabled={!!isUpdatingStatus}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                color
                              )}
                            >
                              <ChevronRight className="h-3 w-3" />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* View / Download */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm" variant="outline"
                          onClick={() => onView(grtn)}
                          className="h-8 w-8 p-0 hover:bg-orange-50 hover:border-orange-300"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onDownload && (
                          <Button
                            size="sm" variant="outline"
                            onClick={() => onDownload(grtn)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>

                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
};
