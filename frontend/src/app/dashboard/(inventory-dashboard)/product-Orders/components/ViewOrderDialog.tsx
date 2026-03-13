"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/form/Dialog";
import { Button } from "@/components/form/CustomButton";
import { Badge } from "@/components/form/Badge";
import { IPurchaseOrder, ISupplier } from "../types/purchaseOrders";
import { getStatusColor, getStatusIcon } from "../utils/purchaseOrderUtils";
import { Building2, Truck, Calendar, Package, Download } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ViewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IPurchaseOrder | null;
  onExport: (filters?: any) => Promise<boolean>;
}

export const ViewOrderDialog: React.FC<ViewOrderDialogProps> = ({
  open,
  onOpenChange,
  order,
  onExport,
}) => {
  if (!order) return null;

  const isSupplierObject = (
    supplier: string | ISupplier,
  ): supplier is ISupplier => {
    return typeof supplier === "object" && supplier !== null;
  };

  const StatusIcon = getStatusIcon(order.status);
  const [exportFilters, setExportFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    supplier: "",
  });

  const handleExportSubmit = async () => {
    try {
      const success = await onExport(order);
      if (success) {
        setExportFilters({
          status: "",
          startDate: "",
          endDate: "",
          supplier: "",
        });
      }
    } finally {
    }
  };
 

  const isProductPopulated = (
  product: string | { _id: string; productName: string; sku: string }
): product is { _id: string; productName: string; sku: string } => {
  return typeof product === "object" && product !== null;
};
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Purchase Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-100">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {order.orderNumber}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Order Date: {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
            <div
              className={cn(
                "px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-white",
                `bg-gradient-to-r ${getStatusColor(order.status)}`,
              )}
            >
              <StatusIcon className="h-5 w-5" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>

          {/* Supplier and Delivery Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm text-gray-600">Supplier</p>
              </div>
              {isSupplierObject(order.supplier) && (
                <>
                  <p className="font-medium text-gray-900">
                    {order.supplier?.contactInformation?.primaryContactName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.supplier?.contactInformation?.emailAddress}
                  </p>
                </>
              )}
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                <p className="text-sm text-gray-600">Expected Delivery</p>
              </div>
              <p className="font-semibold text-gray-900">
                {new Date(order.expectedDelivery).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Additional Info Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="font-semibold text-gray-900">
                  Order Date: {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Items Count</p>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <p className="font-semibold text-gray-900">
                  {order.items.length} items
                </p>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-100">
              <p className="text-sm text-gray-600 mb-1">Order Status</p>
              <Badge
                className={`bg-gradient-to-r ${getStatusColor(order.status)} text-white`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
            <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">
                      SKU
                    </th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">
                      Unit Price
                    </th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-3 text-sm"> {isProductPopulated(item.productId) ? item.productId.productName : ""}</td>
                      <td className="p-3 text-sm font-mono text-gray-600">
                       {isProductPopulated(item.productId) ? item.productId.sku : ""}
                      </td>
                      <td className="p-3 text-sm text-center">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-sm text-right">
                        £{item.unitPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-sm text-right font-semibold">
                        £{(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <td colSpan={3}></td>
                    <td className="p-3 text-sm font-semibold text-gray-700 text-right">
                      Subtotal:
                    </td>
                    <td className="p-3 text-sm font-semibold text-right">
                      £{order.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3}></td>
                    <td className="p-3 text-sm font-semibold text-gray-700 text-right">
                      VAT (20%):
                    </td>
                    <td className="p-3 text-sm font-semibold text-right">
                      £{order.tax.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={3}></td>
                    <td className="p-3 text-lg font-bold text-gray-900 text-right">
                      Total:
                    </td>
                    <td className="p-3 text-lg font-bold text-emerald-600 text-right">
                      £{order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-100">
              <p className="text-sm text-gray-600 mb-2 font-medium">Notes</p>
              <p className="text-gray-900">{order.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={handleExportSubmit}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
