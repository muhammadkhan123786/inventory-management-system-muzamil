"use client";
// PurchaseOrderForm.tsx with React Hook Form validation

import { useState, useMemo, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/form/Dialog";
import { Button }    from "@/components/form/CustomButton";
import { Input }     from "@/components/form/Input";
import { Label }     from "@/components/form/Label";
import { Textarea }  from "@/components/form/Textarea";
import { IPurchaseOrder, IPurchaseOrderItem } from "../types/purchaseOrders";
import { OrderFormData, OrderItemForm }        from "../types/purchaseOrders";
import {
  Plus, Trash2, Building2, Truck, Box,
  RefreshCw, AlertTriangle, CheckCircle2,
  Info, Lock, ClipboardList, ChevronRight, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast }    from "sonner";
import { useFormActions } from "@/hooks/useFormActions";
import { SearchableCombobox, ComboboxItemConfig } from "@/components/SearchableCombobox";
import { ReplenishmentProposalsModal } from "./ReplenishmentProposalsModal";
import { ReorderProduct } from "../components/replenishment/types"
import React from "react";
import { useReorderSuggestions } from '@/hooks/useReorderSuggestions';
import { useCurrencyStore } from "@/stores/currency.store";


// ─── Types ────────────────────────────────────────────────────────────────────

export interface Supplier {
  _id: string;
  legalBusinessName: string;
  contactInformation: { primaryContactName?: string; emailAddress: string };
}

// Form validation types
interface FormValidationSchema {
  supplier: string;
  expectedDelivery: string;
}

export interface ProductPricing {
  _id: string; marketplaceName: string; costPrice: number; sellingPrice: number;
  retailPrice: number; discountPercentage: number; taxRate: number; vatExempt: boolean;
}
export interface ProductStock {
  stockQuantity: number; onHand: number; minStockLevel?: number;
  maxStockLevel?: number; reorderPoint?: number; safetyStock?: number;
  leadTimeDays?: number; avgDailySales?: number; supplierId?: string;
}
export interface ProductAttribute { _id: string; sku: string; pricing: ProductPricing[]; stock: ProductStock; }
export interface ProductFull {
  _id: string; productName: string; sku: string;
  attributes: ProductAttribute[]; ui_price: number; ui_totalStock: number;
}

export interface BulkOrderGroup {
  poNumber:         string;
  supplierId:       string;
  supplierName:     string;
  supplierEmail:    string;
  products:         ReorderProduct[];
  expectedDelivery: string;
}

interface PurchaseOrderFormProps {
  open:               boolean;
  onOpenChange:       (open: boolean) => void;
  editingOrder:       IPurchaseOrder | null;
  orderForm:          OrderFormData;
  onOrderFormChange:  (data: OrderFormData) => void;
  orderItems:         IPurchaseOrderItem[];
  newItem:            OrderItemForm;
  onNewItemChange:    (data: OrderItemForm) => void;
  suppliers:          Supplier[];
  onAddItem:          () => void;
  onRemoveItem:       (index: number) => void;
  onSaveOrder:        () => Promise<boolean>;
  onCancel:           () => void;
  orderNumber:        string;
  userId:             string;
  calculateTotals:    (items: IPurchaseOrderItem[]) => { subtotal: number; tax: number; total: number };
  onCreateBulkOrders?: (groups: BulkOrderGroup[]) => any;
}

// ─── Local helpers ─────────────────────────────────────────────────

// const productConfig: ComboboxItemConfig<ProductFull> = {
//   getKey:           p => p._id,
//   getLabel:         p => p.productName,
//   getSubLabel:      p => p.sku,
//   getRightSubLabel: p => `Stock: ${p.ui_totalStock}`,
//   getRightLabel:    p => `${currencySymbol}${p.ui_price}`,
//   getSearchFields:  p => [p.productName, p.sku],
// };

const getProductConfig = (currencySymbol: string): ComboboxItemConfig<ProductFull> => ({
  getKey: p => p._id,
  getLabel: p => p.productName,
  getSubLabel: p => p.sku,
 getRightSubLabel: p => {
    const totalStock = p.attributes?.reduce(
      (sum, a) => sum + (a.stock?.stockQuantity || 0), 0
    ) ?? 0;
    
    return `Stock: ${totalStock}`;
  },  getRightLabel: p => {
    const price = p.attributes?.[0]?.pricing?.[0]?.costPrice ?? 0;
    return `${currencySymbol}${price}`;
  },
  getSearchFields: p => [p.productName, p.sku],
}); 

function getStockHealth(stock: ProductStock) {
  const { stockQuantity: qty = 0, reorderPoint = 0, minStockLevel = 0, safetyStock = 0 } = stock;
  if (qty <= safetyStock && safetyStock > 0)
    return { needsReorder: true,  isCritical: true,  label: "Critical",      color: "text-red-700",    bg: "bg-red-100 border-red-300" };
  if (reorderPoint > 0 && qty <= reorderPoint)
    return { needsReorder: true,  isCritical: false, label: "Reorder needed", color: "text-orange-700", bg: "bg-orange-100 border-orange-300" };
  if (minStockLevel > 0 && qty <= minStockLevel)
    return { needsReorder: true,  isCritical: false, label: "Below min",      color: "text-amber-700",  bg: "bg-amber-100 border-amber-300" };
  return   { needsReorder: false, isCritical: false, label: "OK",             color: "text-green-700",  bg: "bg-green-100 border-green-300" };
}

function StockChip({ stock }: { stock: ProductStock }) {
  const h = getStockHealth(stock);
  if (!h.needsReorder) return null;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${h.bg} ${h.color}`}
    >
      <AlertTriangle className="h-3 w-3" />{h.label}
    </motion.span>
  );
}

const PricingSelector: React.FC<{
  pricingOptions:    ProductPricing[];
  selectedPricingId: string;
  currencySymbol: string;
  onSelect:          (p: ProductPricing) => void;
}> = ({ pricingOptions, selectedPricingId, onSelect, currencySymbol }) => {
  if (pricingOptions.length <= 1) return null;
  return (
    <div className="col-span-5">
      <p className="text-xs text-indigo-500 font-medium mb-1.5">
        💡 Multiple marketplace prices — select one:
      </p>
      <div className="flex flex-wrap gap-2">
        {pricingOptions.map(p => (
          <button key={p._id} type="button" onClick={() => onSelect(p)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border-2 transition-all ${
              selectedPricingId === p._id
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
            }`}>
            {p.marketplaceName}
            <span className="ml-1.5 font-bold">{currencySymbol}{p.costPrice}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FORM with React Hook Form
// ─────────────────────────────────────────────────────────────────────────────

export const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  open, onOpenChange, editingOrder,
  orderForm, onOrderFormChange,
  orderItems, newItem, onNewItemChange,
  suppliers, onAddItem, onRemoveItem,
  onSaveOrder, onCancel,
  orderNumber, userId,
  onCreateBulkOrders,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [fetchProducts, setFetchProducts] = useState(false);
  const [availablePricing, setAvailablePricing] = useState<ProductPricing[]>([]);
  const [selectedPricingId, setSelectedPricingId] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(true);
  const [selectedProductStock, setSelectedProductStock] = useState<ProductStock | null>(null);
  const [supplierLocked, setSupplierLocked] = useState(false);
  const [showProposals, setShowProposals] = useState(false);
  const [isCreatingBulk, setIsCreatingBulk] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    supplier: false,
    expectedDelivery: false
  });

const currencySymbol = useCurrencyStore((s) => s.currencySymbol);
const productConfig = useMemo(
  () => getProductConfig(currencySymbol),
  [currencySymbol]
);

  // ─── React Hook Form Setup ─────────────────────────────────────────────
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
    watch,
    reset
  } = useForm<FormValidationSchema>({
    mode: 'onChange', // Validate on change
    defaultValues: {
      supplier: orderForm.supplier || '',
      expectedDelivery: orderForm.expectedDelivery || ''
    }
  });

  // Watch values for real-time validation
  const watchedSupplier = watch('supplier');
  const watchedDelivery = watch('expectedDelivery');

  // Update form when orderForm changes
  useEffect(() => {
    setValue('supplier', orderForm.supplier || '');
    setValue('expectedDelivery', orderForm.expectedDelivery || '');
  }, [orderForm, setValue]);

  // Trigger validation when fields change
  useEffect(() => {
    if (touchedFields.supplier) {
      trigger('supplier');
    }
  }, [watchedSupplier, trigger, touchedFields.supplier]);

  useEffect(() => {
    if (touchedFields.expectedDelivery) {
      trigger('expectedDelivery');
    }
  }, [watchedDelivery, trigger, touchedFields.expectedDelivery]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setTouchedFields({ supplier: false, expectedDelivery: false });
    }
  }, [open, reset]);

  const { data: products, isLoading } = useFormActions<ProductFull>(
    "/products", "products", "Product", 1, "", fetchProducts
  );

  const {
    reorderProducts,
    isFetchingReorder,
    reorderFetched,
    fetchReorderSuggestions,
    resetReorderState
  } = useReorderSuggestions({
    userId,
    createAlerts: true,
    sendEmails: false,
    autoFetch: false
  });

  // Auto-fetch when reorder mode turns on (first time only)
  useEffect(() => {
    if (isReorderMode && !reorderFetched) {
      fetchReorderSuggestions();
    }
  }, [isReorderMode, reorderFetched, fetchReorderSuggestions]);

  useEffect(() => {
    if (!open) {
      resetReorderState();
      setIsReorderMode(false);
      setSupplierLocked(false);
    }
  }, [open, resetReorderState]);

  const productsNeedingReorder = reorderProducts.length;

  // ── Open proposals modal ───────────────────────────────────────────────────
  const handleOpenProposals = useCallback(() => {
    setShowProposals(true);
    if (!reorderFetched) fetchReorderSuggestions();
  }, [reorderFetched, fetchReorderSuggestions]);

  // ── Bulk creation handler ──────────────────────────────────────────────────
  const handleCreateBulkOrders = useCallback(async (selected: ReorderProduct[]) => {
    if (!onCreateBulkOrders) { toast.error("Bulk order handler not configured."); return; }
    setIsCreatingBulk(true);
    try {
      const map = new Map<string, ReorderProduct[]>();
      selected.forEach(p => {
        const key = p.supplierId || "no-supplier";
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
      });

      const groups: BulkOrderGroup[] = Array.from(map.entries()).map(([supplierId, prods]) => ({
        poNumber: "",
        supplierId,
        supplierName: prods[0].supplierName,
        supplierEmail: prods[0].supplierEmail,
        products: prods,
        expectedDelivery: "",
      }));

      await onCreateBulkOrders(groups);

      toast.success(
        `${groups.length} purchase order${groups.length > 1 ? "s" : ""} created and emailed!`,
        { duration: 4000 }
      );

      await fetchReorderSuggestions(true);
      setShowProposals(false);
    onOpenChange(false);
    } catch {
      toast.error("Failed to create purchase orders.");
    } finally {
      setIsCreatingBulk(false);
    }
  }, [onCreateBulkOrders, fetchReorderSuggestions]);

  // ── Reorder mode toggle ────────────────────────────────────────────────────
  const handleReorderToggle = (val: boolean) => {
    setIsReorderMode(val);
    if (!val) {
      setSupplierLocked(false);
      setSelectedProductStock(null);
      onOrderFormChange({ ...orderForm, supplier: "", orderContactEmail: "" });
      setValue('supplier', '');
    }
  };

  // ── Product input handlers ────────────────────────────────────
  const handleProductInputChange = (value: string) => {
    onNewItemChange({ ...newItem, productName: value, productId: "" });
    setAvailablePricing([]); setSelectedPricingId(""); setSelectedProductStock(null);
    if (isReorderMode) setSupplierLocked(false);
  };

  const handleProductSelect = (product: ProductFull) => {
    const allPricing = product.attributes.flatMap(a => a.pricing);
    const firstPricing = allPricing[0];
    const stock = product.attributes[0]?.stock ?? null;

    setAvailablePricing(allPricing);
    setSelectedPricingId(firstPricing?._id ?? "");
    setSelectedProductStock(stock);

    onNewItemChange({
      ...newItem,
      productId: product._id,
      productName: product.productName,
      sku: product.attributes[0]?.sku ?? product.sku,
      quantity: newItem.quantity || "1",
      unitPrice: firstPricing ? String(firstPricing.costPrice) :"0",
    });

    // Reorder mode: auto-fill supplier from product's linked supplier
    if (isReorderMode && stock?.supplierId) {
      const id = (stock.supplierId as any)?.$oid ?? stock.supplierId;
      const linked = suppliers.find(s => s._id === id);
      if (linked) {
        onOrderFormChange({
          ...orderForm,
          supplier: linked._id,
          orderContactEmail: linked.contactInformation?.emailAddress || "",
        });
        setValue('supplier', linked._id);
        setSupplierLocked(true);
        toast.success(
          `Supplier "${linked.legalBusinessName || linked.contactInformation?.primaryContactName}" auto-selected`,
          { icon: "🔗" }
        );
      } else {
        setSupplierLocked(false);
        toast.warning("No linked supplier for this product. Please select manually.");
      }
    }
  };

  const handleProductClear = () => {
    onNewItemChange({ ...newItem, productId: "", productName: "", sku: "", unitPrice: "" });
    setAvailablePricing([]); setSelectedPricingId(""); setSelectedProductStock(null);
    if (isReorderMode) {
      setSupplierLocked(false);
      onOrderFormChange({ ...orderForm, supplier: "", orderContactEmail: "" });
      setValue('supplier', '');
    }
  };

  const handleAddItem = () => {
    onAddItem();
    setAvailablePricing([]);
    setSelectedPricingId("");
  };


  const handlePricingSelect = (p: ProductPricing) => {
    setSelectedPricingId(p._id);
    onNewItemChange({ ...newItem, unitPrice: String(p.costPrice) });
  };

  const handleSupplierChange = (id: string) => {
    if (supplierLocked) return;
    const f = suppliers.find(s => s._id === id);
    onOrderFormChange({
      ...orderForm,
      supplier: id,
      orderContactEmail: f?.contactInformation?.emailAddress || "",
    });
    setValue('supplier', id);
    setTouchedFields(prev => ({ ...prev, supplier: true }));
  };

  const handleDeliveryChange = (value: string) => {
    onOrderFormChange({ ...orderForm, expectedDelivery: value });
    setValue('expectedDelivery', value);
    setTouchedFields(prev => ({ ...prev, expectedDelivery: true }));
  };

  // ─── Form Submit Handler with Validation ──────────────────────────────
  const onFormSubmit = async (data: FormValidationSchema) => {
    // Mark all fields as touched
    setTouchedFields({
      supplier: true,
      expectedDelivery: true
    });

    // Final validation
    if (!data.supplier) {
      toast.error('Please select a supplier');
      document.querySelector('#supplier-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!data.expectedDelivery) {
      toast.error('Please select expected delivery date');
      document.querySelector('#delivery-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item');
      document.querySelector('#items-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSaving(true);
    try {
      const ok = await onSaveOrder();
      if (ok) { 
        toast.success("Purchase order created!"); 
        onCancel(); 
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to save order');
    } finally {
      setIsSaving(false);
    }
  };

  const totals = useMemo(() => {
    const sub = orderItems.reduce(
      (s, i) => s + (i.unitPrice || 0) * (Number(i.quantity) || 0), 0
    );
    return {
    subtotal: sub.toFixed(2),
    tax:      (sub * 0.2).toFixed(2),
    total:    (sub * 1.2).toFixed(2),
  };
  }, [orderItems]);

  const currentSupplierName = useMemo(() => {
    const f = suppliers.find(s => s._id === orderForm.supplier);
    return f?.legalBusinessName || f?.contactInformation?.primaryContactName || "";
  }, [suppliers, orderForm.supplier]);

  const severityCounts = useMemo(() => ({
    critical: reorderProducts.filter(p => p.severity === "critical").length,
    warning: reorderProducts.filter(p => p.severity === "warning").length,
    low: reorderProducts.filter(p => p.severity === "low").length,
  }), [reorderProducts]);


  const handleProposalsClose = useCallback((open: boolean) => {
  setShowProposals(open);
  if (!open) {
    // Close the purchase order form as well
    onOpenChange(false);
  }
}, [onOpenChange]);

  // ─────────────────────────────────────────────────────────────────────
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {editingOrder ? "Edit Purchase Order" : "Create Purchase Order"}
            </DialogTitle>
            <DialogDescription>
              {editingOrder
                ? "Update purchase order details"
                : "Fill in the details to create a new purchase order"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit(onFormSubmit)} className="space-y-6">
            {/* ── Order number + date ──────────────────────────────────── */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-lg border-2 border-indigo-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Purchase Order Number</Label>
                  <p className="text-xl font-bold text-gray-900 font-mono bg-white px-3 py-2 rounded border border-indigo-200">
                    {editingOrder ? editingOrder.orderNumber : orderNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1 block">Order Date</Label>
                  <p className="text-xl font-bold text-gray-900 bg-white px-3 py-2 rounded border border-indigo-200">
                    {editingOrder
                      ? new Date(editingOrder.orderDate).toLocaleDateString("en-GB")
                      : new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Reorder mode toggle + proposals button ───────────────── */}
            <div className="space-y-3">
              {/* Toggle */}
              <motion.label whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer select-none transition-all ${
                  isReorderMode
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 shadow-sm"
                    : "bg-white border-gray-200 hover:border-amber-300"
                }`}>
                <input
                  type="checkbox" className="sr-only"
                  checked={isReorderMode}
                  onChange={e => handleReorderToggle(e.target.checked)}
                />
                <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                  isReorderMode ? "bg-amber-500 border-amber-500" : "bg-white border-gray-300"
                }`}>
                  {isReorderMode && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`h-4 w-4 ${isReorderMode ? "text-amber-600" : "text-gray-400"}`} />
                    <span className={`text-sm font-semibold ${isReorderMode ? "text-amber-800" : "text-gray-700"}`}>
                      Reorder Mode
                    </span>
                    {isReorderMode && (
                      isFetchingReorder ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-bold rounded-full">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        </span>
                      ) : productsNeedingReorder > 0 ? (
                        <motion.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full"
                        >
                          {productsNeedingReorder}
                        </motion.span>
                      ) : reorderFetched ? (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                          All stocked
                        </span>
                      ) : null
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isReorderMode ? "text-amber-700" : "text-gray-500"}`}>
                    Auto-fills supplier from product · access replenishment proposals
                  </p>
                </div>
                {isReorderMode && <Lock className="h-4 w-4 text-amber-500 shrink-0" />}
              </motion.label>

              {/* Proposals button */}
              <AnimatePresence>
                {isReorderMode && (
                  <motion.button
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    type="button"
                    onClick={handleOpenProposals}
                    disabled={isFetchingReorder}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        {isFetchingReorder
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <ClipboardList className="h-4 w-4" />}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">View Replenishment Proposals</p>
                        <p className="text-xs text-indigo-200">
                          {isFetchingReorder
                            ? "Checking stock levels and active POs…"
                            : productsNeedingReorder > 0
                              ? `${productsNeedingReorder} product${productsNeedingReorder !== 1 ? "s" : ""} need restocking${
                                  severityCounts.critical > 0 ? ` · ${severityCounts.critical} critical` : ""
                                } · no active PO`
                              : reorderFetched
                                ? "All products are fully stocked or already on order"
                                : "Click to analyse stock levels…"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isFetchingReorder && productsNeedingReorder > 0 && (
                        <div className="hidden sm:flex items-center gap-1">
                          {severityCounts.critical > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                              {severityCounts.critical} critical
                            </span>
                          )}
                          {severityCounts.warning > 0 && (
                            <span className="px-2 py-0.5 bg-orange-400 text-white text-[10px] font-bold rounded-full">
                              {severityCounts.warning} reorder
                            </span>
                          )}
                          {severityCounts.low > 0 && (
                            <span className="px-2 py-0.5 bg-amber-400 text-white text-[10px] font-bold rounded-full">
                              {severityCounts.low} low
                            </span>
                          )}
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Refresh button */}
              <AnimatePresence>
                {isReorderMode && reorderFetched && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex justify-end"
                  >
                    <button
                      type="button"
                      onClick={() => fetchReorderSuggestions(true)}
                      disabled={isFetchingReorder}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 ${isFetchingReorder ? "animate-spin" : ""}`} />
                      Refresh stock analysis
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Supplier auto-filled banner */}
              <AnimatePresence>
                {isReorderMode && supplierLocked && currentSupplierName && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                      <RefreshCw className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800">Supplier Auto-Selected</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        <strong>{currentSupplierName}</strong> linked from product
                        {newItem.productName ? ` for ${newItem.productName}` : ""}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Supplier Section with Validation ────────────────────────────── */}
            <div id="supplier-section" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                Supplier Information
                <span className="text-red-500 text-sm font-normal">*</span>
                {supplierLocked && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    <Lock className="h-3 w-3" />Auto-filled from product
                  </motion.span>
                )}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Supplier Name <span className="text-red-500">*</span>
                    {touchedFields.supplier && errors.supplier && (
                      <span className="text-xs text-red-500 font-normal ml-auto">
                        {errors.supplier.message}
                      </span>
                    )}
                  </Label>
                  
                  <Controller
                    name="supplier"
                    control={control}
                    rules={{ 
                      required: 'Supplier is required' 
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <select
                          {...field}
                          value={orderForm.supplier}
                          onChange={(e) => {
                            field.onChange(e);
                            handleSupplierChange(e.target.value);
                          }}
                          onBlur={() => {
                            field.onBlur();
                            setTouchedFields(prev => ({ ...prev, supplier: true }));
                          }}
                          disabled={isSaving || supplierLocked}
                          className={`w-full h-10 px-3 rounded-md border-2 focus:outline-none transition-colors ${
                            touchedFields.supplier && errors.supplier
                              ? 'border-red-300 bg-red-50 focus:border-red-500'
                              : supplierLocked
                                ? 'border-amber-300 bg-amber-50 text-amber-900 cursor-not-allowed opacity-80'
                                : 'border-emerald-100 hover:border-emerald-300 focus:border-emerald-400'
                          }`}
                        >
                          <option value="">Select a supplier...</option>
                          {suppliers.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.legalBusinessName || s.contactInformation?.primaryContactName}
                            </option>
                          ))}
                        </select>
                        
                        {touchedFields.supplier && errors.supplier && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                        
                        {supplierLocked && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Lock className="h-4 w-4 text-amber-500" />
                          </div>
                        )}
                      </div>
                    )}
                  />
                  
                  <AnimatePresence>
                    {touchedFields.supplier && errors.supplier && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-500 flex items-center gap-1 mt-1"
                      >
                        <Info className="h-3 w-3" />
                        {errors.supplier.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  {supplierLocked && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <Info className="h-3 w-3" />Clear product to change supplier.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Contact Email *</Label>
                  <Input type="email" value={orderForm.orderContactEmail || ""}
                    placeholder="supplier@email.com" disabled
                    className={`border-2 ${touchedFields.supplier && errors.supplier ? 'border-red-300' : 'border-emerald-100'}`} />
                </div>
              </div>
            </div>

            {/* ── Delivery Section with Validation ───────────────────────────── */}
            <div id="delivery-section" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-teal-600" />
                Delivery Information
                <span className="text-red-500 text-sm font-normal">*</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Expected Delivery Date <span className="text-red-500">*</span>
                    {touchedFields.expectedDelivery && errors.expectedDelivery && (
                      <span className="text-xs text-red-500 font-normal ml-auto">
                        {errors.expectedDelivery.message}
                      </span>
                    )}
                  </Label>
                  
                  <Controller
                    name="expectedDelivery"
                    control={control}
                    rules={{ 
                      required: 'Expected delivery date is required' 
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <Input 
                          type="date" 
                          value={orderForm.expectedDelivery} 
                          disabled={isSaving}
                          onChange={(e) => {
                            field.onChange(e);
                            handleDeliveryChange(e.target.value);
                          }}
                          onBlur={() => {
                            field.onBlur();
                            setTouchedFields(prev => ({ ...prev, expectedDelivery: true }));
                          }}
                          className={`border-2 ${
                            touchedFields.expectedDelivery && errors.expectedDelivery
                              ? 'border-red-300 bg-red-50 focus:border-red-500'
                              : 'border-teal-100 hover:border-teal-300 focus:border-teal-400'
                          }`}
                        />
                        
                        {touchedFields.expectedDelivery && errors.expectedDelivery && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    )}
                  />
                  
                  <AnimatePresence>
                    {touchedFields.expectedDelivery && errors.expectedDelivery && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-500 flex items-center gap-1 mt-1"
                      >
                        <Info className="h-3 w-3" />
                        {errors.expectedDelivery.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={orderForm.notes} rows={3} disabled={isSaving}
                    placeholder="Additional notes..."
                    onChange={e => onOrderFormChange({ ...orderForm, notes: e.target.value })}
                    className="border-2 border-teal-100 hover:border-teal-300 focus:border-teal-400" />
                </div>
              </div>
            </div>

            {/* ── Order items section ──────────────────────────────────────── */}
            <div id="items-section" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Box className="h-5 w-5 text-indigo-600" />
                Order Items
                {orderItems.length === 0 && (
                  <span className="text-xs text-red-500 font-normal">(At least one item required)</span>
                )}
              </h3>
              
              {/* Items Error Banner */}
              <AnimatePresence>
                {orderItems.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        At least one item is required
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Please add a product to continue
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-100 space-y-3">
                <div className="grid grid-cols-5 gap-3">
                  <SearchableCombobox<ProductFull>
                    items={(products as ProductFull[] | undefined) ?? []}
                    inputValue={newItem.productName}
                    isSelected={!!newItem.productId}
                    onInputChange={handleProductInputChange}
                    onSelect={handleProductSelect}
                    onClear={handleProductClear}
                    onFirstOpen={() => setFetchProducts(true)}
                    config={productConfig}
                    placeholder="Search product..."
                    isLoading={isLoading}
                    disabled={isSaving}
                    colorTheme="indigo"
                    className="col-span-2"
                  />
                  <Input placeholder="SKU" value={newItem.sku} className="h-10"
                    disabled={isSaving}
                    onChange={e => onNewItemChange({ ...newItem, sku: e.target.value })} />
                  <Input type="number" placeholder="Qty" value={newItem.quantity}
                    min="1" className="h-10" disabled={isSaving}
                    onChange={e => onNewItemChange({ ...newItem, quantity: e.target.value })} />
                  <div className="flex gap-2">
                    <Input type="number" step="0.01" placeholder="Price" value={newItem.unitPrice}
                      min="0" className="h-10" disabled={isSaving}
                      onChange={e => onNewItemChange({ ...newItem, unitPrice: e.target.value })} />
                    <Button onClick={handleAddItem} size="sm" type="button" disabled={isSaving}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <PricingSelector
                    pricingOptions={availablePricing}
                    selectedPricingId={selectedPricingId}
                    onSelect={handlePricingSelect}
                    currencySymbol = { currencySymbol }
                  />
                </div>

                <AnimatePresence>
                  {selectedProductStock && newItem.productId && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <span className="text-xs text-gray-500">Stock status:</span>
                      <StockChip stock={selectedProductStock} />
                      <span className="text-xs text-gray-500">
                        {selectedProductStock.stockQuantity} units on hand
                        {selectedProductStock.reorderPoint ? ` · reorder at ${selectedProductStock.reorderPoint}` : ""}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {orderItems.length > 0 ? (
                <div className="border-2 border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        {["Product", "SKU", "Qty", "Unit Price", "Total", ""].map((h, i) => (
                          <th key={i} className={`p-3 text-sm font-semibold text-gray-700 ${
                            i === 2 ? "text-center" : i >= 3 && i < 5 ? "text-right" : i === 5 ? "text-center" : "text-left"
                          }`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, idx) => (
                        
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="p-3 text-sm">{item.productName}</td>
                          <td className="p-3 text-sm font-mono text-gray-600">{item.sku}</td>
                          <td className="p-3 text-sm text-center">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">{currencySymbol}{item.unitPrice}</td>
                          <td className="p-3 text-sm text-right font-semibold">{currencySymbol}{item.totalPrice}</td>
                          <td className="p-3 text-center">
                            <Button size="sm" variant="ghost" type="button"
                              onClick={() => onRemoveItem(idx)} disabled={isSaving}
                              className="hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-8 border-2 border-dashed rounded-lg transition-colors ${
                  orderItems.length === 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                }`}>
                  <Box className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No items added yet.</p>
                  {orderItems.length === 0 && (
                    <p className="text-xs text-red-500 mt-2 flex items-center justify-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Please add at least one item
                    </p>
                  )}
                </div>
              )}

              {orderItems.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border-2 border-emerald-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{currencySymbol}{totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (20%):</span>
                    <span className="font-semibold">{currencySymbol}{totals.tax}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t-2 border-emerald-200 pt-2">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold text-emerald-600">{currencySymbol}{totals.total}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onCancel} disabled={isSaving} type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || orderItems.length === 0 || !isValid}
                className={`bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 ${
                  (isSaving || orderItems.length === 0 || !isValid) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  editingOrder ? "Update Order" : "Create Order"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Proposals modal */}
      <ReplenishmentProposalsModal
        open={showProposals}
        onOpenChange={handleProposalsClose}
        products={reorderProducts}
        onCreateOrders={handleCreateBulkOrders}
        isCreating={isCreatingBulk}
        //  onOpenChange={handleProposalsClose} 
      />
    </>
  );
};