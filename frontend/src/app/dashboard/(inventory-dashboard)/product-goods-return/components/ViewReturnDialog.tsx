"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/form/Dialog";
import { Button } from "@/components/form/CustomButton";
import { Badge } from "@/components/form/Badge";
import { Card, CardContent } from "@/components/form/Card";
import { GoodsReturnNote } from "../types/goodsReturn";
import {
  getStatusColor,
  getStatusIcon,
  getReturnReasonColor,
} from "../utils/goodsReturnUtils";
import {
  FileText,
  Truck,
  Calendar,
  User,
  RotateCcw,
  Download,
  PackageX,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ViewReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grtn: any ;
  onDownload: any;
}

export const ViewReturnDialog: React.FC<ViewReturnDialogProps> = ({
  open,
  onOpenChange,
  grtn,
  onDownload,
}) => {
  if (!grtn) return null;

  const totalReturnAmount = React.useMemo(() => {
    return grtn.items.reduce((sum: any, item: any) => sum + item.totalAmount, 0);
  }, [grtn.items]);
  const StatusIcon = getStatusIcon(grtn.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                `bg-gradient-to-br ${getStatusColor(grtn.status)}`,
              )}
            >
              <PackageX className="h-4 w-4 text-white" />
            </div>
            {grtn.grtnNumber}
          </DialogTitle>
          <DialogDescription>
            Goods Return Note Details - {grtn.grnId?.grnNumber} /{" "}
            {grtn.grnId?.purchaseOrderId?.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2 border-orange-100 bg-orange-50">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-orange-600 font-medium">
                  GRN Reference
                </p>
                <p className="text-lg font-bold text-orange-900">
                  {grtn.grnId?.grnNumber}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-100 bg-purple-50">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-purple-600 font-medium">Supplier</p>
                <p className="text-lg font-bold text-purple-900">
                  {
                    grtn.grnId?.purchaseOrderId?.supplier?.contactInformation
                      ?.primaryContactName
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Return Details Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>Return Date</span>
              </div>
              <p className="font-medium text-gray-900">
                {new Date(grtn.returnDate).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 text-green-500" />
                <span>Returned By</span>
              </div>
              <p className="font-medium text-gray-900">{grtn.returnedBy}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                <span>Status</span>
              </div>
              <Badge
                className={cn(
                  "text-white border-0 mt-1",
                  `bg-gradient-to-r ${getStatusColor(grtn.status)}`,
                )}
              >
                {grtn?.status
                  ?.split("-")
                  .map((w: any) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </Badge>
            </div>
          </div>

          {/* Return Reason */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-amber-700 mb-1">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Return Reason</span>
            </div>
            <p className="font-medium text-amber-900">{grtn.returnReason}</p>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-900">
                Returned Items
              </h4>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                {grtn.items.length} item(s)
              </Badge>
            </div>
            <div className="space-y-3">
              {grtn?.grnId?.purchaseOrderId?.items?.map((poItem: any, index: number) => {
                const grnItem = grtn?.grnId?.items[index];
                const returnItem = grtn?.items[index];

                return (
                  <Card key={index} className="border-2 border-gray-100">
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {poItem.productName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            SKU: {poItem.sku}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-[#ea580c]">
                            £{returnItem.totalAmount}
                          </p>
                          <p className="text-xs text-gray-500">
                            £{poItem.unitPrice} × {returnItem.returnQty}
                          </p>
                        </div>
                      </div>

                      {/* Quantities */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Received Qty</p>
                          <p className="font-medium">
                            {grnItem?.receivedQuantity}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Return Qty</p>
                          <p className="font-medium text-red-600">
                            {returnItem.returnQty}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Status</p>
                          <Badge
                            className={cn(
                              "text-white border-0 bg-gradient-to-r",
                              getStatusColor(returnItem?.status),
                            )}
                          >
                            {returnItem?.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Condition */}
                      {grnItem?.condition && (
                        <div className="bg-gray-50 rounded p-3 mb-2">
                          <p className="text-xs text-gray-600 mb-1">
                            Condition
                          </p>
                          <p className="text-sm text-gray-900">
                            {grnItem.condition}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {(returnItem.itemsNotes || grnItem?.notes) && (
                        <div className="bg-blue-50 rounded p-3">
                          <p className="text-xs text-blue-600 mb-1">Notes</p>
                          <p className="text-sm text-blue-900">
                            {returnItem.itemsNotes || grnItem?.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {grtn.notes && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-indigo-700 mb-1">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Additional Notes</span>
              </div>
              <p className="text-sm text-gray-900">{grtn.notes}</p>
            </div>
          )}

          {/* Total */}
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">
                    Total Return Value
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {grtn.items.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-orange-900">
                    £{totalReturnAmount}
                  </p>{" "}
                  <p className="text-sm text-orange-700">
                    Created: {new Date(grtn.returnDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => onDownload?.(grtn)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
