'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/form/Dialog';
import { Button } from '@/components/form/CustomButton';
import { Badge } from '@/components/form/Badge';
import { Card, CardContent } from '@/components/form/Card';
import { GoodsReceivedNote, PurchaseOrder, PopulatedProduct } from '../types/goodsReceived';
import { User, Download, Package } from 'lucide-react';
import * as React from 'react';

interface ViewGRNDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grn: GoodsReceivedNote | null;
  handleDownloadGRN: (grn: GoodsReceivedNote) => Promise<void>;
}

// Enriched lookup entry — product info + ordered quantity from the PO
interface POItemLookup {
  product: PopulatedProduct;
  orderedQuantity: number;
}

export const ViewGRNDialog: React.FC<ViewGRNDialogProps> = ({
  open,
  onOpenChange,
  grn,
  handleDownloadGRN,
}) => {
  if (!grn) return null;

  const purchaseOrder = grn.purchaseOrderId as PurchaseOrder;

  // ── Build lookup: productId string → { product, orderedQuantity } ──
  // Source of truth for productName, sku AND ordered qty is purchaseOrder.items
  const poItemLookup = React.useMemo<Record<string, POItemLookup>>(() => {
    if (!purchaseOrder?.items) return {};
    return purchaseOrder.items.reduce((acc, poItem) => {
      const product = poItem.productId as PopulatedProduct;
      if (product?._id) {
        acc[product._id] = {
          product,
          orderedQuantity: poItem.quantity ?? 0,
        };
      }
      return acc;
    }, {} as Record<string, POItemLookup>);
  }, [purchaseOrder]);

  // ── Resolve PO lookup entry for a GRN item ──
  const resolvePOItem = (item: GoodsReceivedNote['items'][number]): POItemLookup | null => {
    const rawId =
      typeof item.productId === 'object'
        ? item.productId?._id
        : (item.productId as unknown as string);
    return rawId && poItemLookup[rawId] ? poItemLookup[rawId] : null;
  };

  // ── Totals ──
  const totals = React.useMemo(() => {
    // Total ordered = sum of quantity from PO items (source of truth)
    const totalOrdered = purchaseOrder?.items?.reduce(
      (sum, poItem) => sum + (poItem.quantity ?? 0), 0
    ) ?? 0;

    const { received, accepted, rejected, damaged } = grn.items.reduce(
      (acc, item) => {
        acc.received += item.receivedQuantity ?? 0;
        acc.accepted += item.acceptedQuantity ?? 0;
        acc.rejected += item.rejectedQuantity ?? 0;
        acc.damaged  += item.damageQuantity   ?? 0;
        return acc;
      },
      { received: 0, accepted: 0, rejected: 0, damaged: 0 }
    );

    return { totalOrdered, received, accepted, rejected, damaged };
  }, [grn.items, purchaseOrder]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {grn.grnNumber}
          </DialogTitle>
          <DialogDescription>Goods Received Note Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ── GRN Info ── */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Purchase Order</p>
              <p className="font-semibold text-gray-900">{purchaseOrder?.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Supplier</p>
              <p className="font-semibold text-gray-900">
                {purchaseOrder?.supplier?.contactInformation?.primaryContactName ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Delivery</p>
              <p className="font-semibold text-gray-900">
                {purchaseOrder?.expectedDelivery
                  ? new Date(purchaseOrder.expectedDelivery).toLocaleDateString()
                  : 'No date'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Received By</p>
              <p className="font-semibold text-gray-900">{grn.receivedBy}</p>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-5 gap-3">
            {/* Total Ordered — sum of purchaseOrder.items[].quantity */}
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
              <CardContent className="p-4">
                <p className="text-sm text-white/80 mb-1">Total Ordered</p>
                <p className="text-3xl font-bold">{totals.totalOrdered}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white border-0">
              <CardContent className="p-4">
                <p className="text-sm text-white/80 mb-1">Received</p>
                <p className="text-3xl font-bold">{totals.received}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-4">
                <p className="text-sm text-white/80 mb-1">Accepted</p>
                <p className="text-3xl font-bold">{totals.accepted}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0">
              <CardContent className="p-4">
                <p className="text-sm text-white/80 mb-1">Rejected</p>
                <p className="text-3xl font-bold">{totals.rejected}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
              <CardContent className="p-4">
                <p className="text-sm text-white/80 mb-1">Damaged</p>
                <p className="text-3xl font-bold">{totals.damaged}</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Items Table ── */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Received Items
            </h3>
            <div className="border-2 border-blue-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <th className="text-left p-3 font-semibold text-gray-700">Product</th>
                    {/* Ordered qty comes from PO item — per product */}
                    <th className="text-center p-3 font-semibold text-gray-700">Ordered</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Received</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Accepted</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Rejected</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Damaged</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Condition</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {grn.items.map((item, index) => {
                    const poItem = resolvePOItem(item);

                    // Product name & SKU — from PO lookup, then GRN item flat fields
                    const productName = poItem?.product?.productName ?? item.productName ?? '—';
                    const sku         = poItem?.product?.sku         ?? item.sku         ?? '—';

                    // Ordered qty — per-product from PO (individual level)
                    const orderedQty  = poItem?.orderedQuantity ?? '—';

                    return (
                      <tr key={item._id ?? index} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-medium">{productName}</p>
                          <p className="text-xs text-gray-500 font-mono">{sku}</p>
                        </td>

                        {/* Individual ordered qty for this specific product */}
                        <td className="p-3 text-center">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {orderedQty}
                          </Badge>
                        </td>

                        <td className="p-3 text-center">
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            {item.receivedQuantity}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {item.acceptedQuantity}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {item.rejectedQuantity > 0 ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              {item.rejectedQuantity}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.damageQuantity > 0 ? (
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              {item.damageQuantity}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge className={
                            item.condition === 'good'    ? 'bg-green-100 text-green-700 border-green-200' :
                            item.condition === 'damaged' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                          'bg-red-100 text-red-700 border-red-200'
                          }>
                            {item.condition}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600">{item.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Notes ── */}
          {grn.notes && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Notes</p>
              <p className="text-gray-900">{grn.notes}</p>
            </div>
          )}

          {/* ── Signature ── */}
          {grn.signature && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Signed by: <strong className="text-gray-900">{grn.signature}</strong></span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button
            onClick={() => handleDownloadGRN(grn)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};