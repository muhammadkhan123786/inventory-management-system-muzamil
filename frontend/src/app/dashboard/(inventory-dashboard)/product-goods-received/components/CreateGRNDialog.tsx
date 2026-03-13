"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/form/Dialog";
import { Button } from "@/components/form/CustomButton";
import { Input } from "@/components/form/Input";
import { Label } from "@/components/form/Label";
import { Badge } from "@/components/form/Badge";
import { Textarea } from "@/components/form/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";
import {
  PurchaseOrder,
  GoodsReceivedNoteItem,
  NewProductForm,
} from "../types/goodsReceived";
import { Plus, CheckCircle2, Package, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchableCombobox, ComboboxItemConfig } from "@/components/SearchableCombobox";

// ─── Combobox config for PurchaseOrder ───────────────────────────────────────

const poConfig: ComboboxItemConfig<PurchaseOrder> = {
  getKey:          (po) => po._id,
  getLabel:        (po) => po.orderNumber,
  getSubLabel:     (po) => po.supplier?.contactInformation?.primaryContactName ?? "Unknown supplier",
  getRightSubLabel:(po) => `${po.items.length} item${po.items.length !== 1 ? "s" : ""}`,
  getRightLabel:   (po) => po.status,
  getSearchFields: (po) => [
    po.orderNumber,
    po.supplier?.contactInformation?.primaryContactName ?? "",
  ],
};

// ─── Form Validation Interface ────────────────────────────────────────────────

interface GRNFormSchema {
  selectedPO: string;
  receivedBy: string;
  grnNotes: string;
  receivingItems: GoodsReceivedNoteItem[];
  newProduct: NewProductForm;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateGRNDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPO: string;
  onSelectPO: (poId: string) => void;
  receivedBy: string;
  onReceivedByChange: (value: string) => void;
  grnNotes: string;
  onGRNNotesChange: (value: string) => void;
  receivingItems: GoodsReceivedNoteItem[];
  onUpdateItem: (itemId: string, field: string, value: any) => void;
  newProduct: NewProductForm;
  onNewProductChange: (data: NewProductForm) => void;
  onAddManualProduct: () => void;
  availablePOs: PurchaseOrder[];
  onCreateGRN: () => void;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CreateGRNDialog: React.FC<CreateGRNDialogProps> = ({
  open,
  onOpenChange,
  selectedPO: externalSelectedPO,
  onSelectPO: externalOnSelectPO,
  receivedBy: externalReceivedBy,
  onReceivedByChange: externalOnReceivedByChange,
  grnNotes: externalGRNNotes,
  onGRNNotesChange: externalOnGRNNotesChange,
  receivingItems: externalReceivingItems,
  onUpdateItem: externalOnUpdateItem,
  newProduct: externalNewProduct,
  onNewProductChange: externalOnNewProductChange,
  onAddManualProduct,
  availablePOs,
  onCreateGRN,
  onCancel,
}) => {
  // ─── Local State ──────────────────────────────────────────────────────────
  const [poSearch, setPOSearch] = useState("");
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [itemTouched, setItemTouched] = useState<Record<string, boolean>>({});

  // ─── React Hook Form Setup ─────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<GRNFormSchema>({
    mode: 'onChange',
    defaultValues: {
      selectedPO: externalSelectedPO || '',
      receivedBy: externalReceivedBy || '',
      grnNotes: externalGRNNotes || '',
      receivingItems: externalReceivingItems || [],
      newProduct: externalNewProduct || {
        productName: '',
        sku: '',
        orderedQuantity: 0,
        receivedQuantity: 0,
        unitPrice: 0
      }
    }
  });

  // Watch values for real-time validation
  const watchedPO = watch('selectedPO');
  const watchedReceivedBy = watch('receivedBy');
  const watchedItems = watch('receivingItems') || [];

  // Update form when external props change
  useEffect(() => {
    setValue('selectedPO', externalSelectedPO || '');
    setValue('receivedBy', externalReceivedBy || '');
    setValue('grnNotes', externalGRNNotes || '');
    setValue('receivingItems', externalReceivingItems || []);
    setValue('newProduct', externalNewProduct || {
      productName: '',
      sku: '',
      orderedQuantity: 0,
      receivedQuantity: 0,
      unitPrice: 0
    });
  }, [
    externalSelectedPO, externalReceivedBy, externalGRNNotes,
    externalReceivingItems, externalNewProduct, setValue
  ]);

  // Trigger validation when fields change
  useEffect(() => {
    if (touchedFields.selectedPO) trigger('selectedPO');
  }, [watchedPO, trigger, touchedFields.selectedPO]);

  useEffect(() => {
    if (touchedFields.receivedBy) trigger('receivedBy');
  }, [watchedReceivedBy, trigger, touchedFields.receivedBy]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setTouchedFields({});
      setItemTouched({});
      setPOSearch("");
    }
  }, [open, reset]);

  const selectedPOObj = availablePOs.find((po) => po._id === watchedPO) ?? null;

  // ─── Validation Rules ───────────────────────────────────────────────────

  // Check if any items have validation issues
  const hasItemErrors = watchedItems.some(item => {
    const hasRejectError = (item.rejectedQuantity || 0) > (item.receivedQuantity || 0);
    const hasDamageError = (item.damageQuantity || 0) > (item.receivedQuantity || 0);
    const hasRejectWithoutNotes = (item.rejectedQuantity || 0) > 0 && !item.notes?.trim();
    const hasDamageWithoutNotes = (item.damageQuantity || 0) > 0 && !item.notes?.trim();
    return hasRejectError || hasDamageError || hasRejectWithoutNotes || hasDamageWithoutNotes;
  });

  // Check if all items with reject/damage have notes
  const allItemsHaveNotes = watchedItems.every(item => {
    if ((item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0) {
      return item.notes?.trim() && item.notes.trim().length > 0;
    }
    return true;
  });

  // Check if any items have quantities
  const hasReceivedItems = watchedItems.some(item => (item.receivedQuantity || 0) > 0);

  // Form validation function
  const validateForm = (data: GRNFormSchema) => {
    const errors: Record<string, string> = {};
    
    if (!data.selectedPO) {
      errors.selectedPO = 'Please select a purchase order';
    }
    
    if (!data.receivedBy?.trim()) {
      errors.receivedBy = 'Receiver name is required';
    }
    
    if (!hasReceivedItems) {
      errors.items = 'At least one item must have received quantity > 0';
    }
    
    data.receivingItems?.forEach((item, index) => {
      if ((item.rejectedQuantity || 0) > (item.receivedQuantity || 0)) {
        errors[`items.${index}.rejectedQuantity`] = 'Rejected quantity cannot exceed received quantity';
      }
      if ((item.damageQuantity || 0) > (item.receivedQuantity || 0)) {
        errors[`items.${index}.damageQuantity`] = 'Damaged quantity cannot exceed received quantity';
      }
      if ((item.rejectedQuantity || 0) > 0 && !item.notes?.trim()) {
        errors[`items.${index}.rejectedNotes`] = 'Notes required for rejected items';
      }
      if ((item.damageQuantity || 0) > 0 && !item.notes?.trim()) {
        errors[`items.${index}.damageNotes`] = 'Notes required for damaged items';
      }
    });
    
    return errors;
  };

  // Handle field touch
  const handleFieldTouch = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    trigger(field as any);
  };

  // Handle item field touch
  const handleItemTouch = (itemId: string, field: string) => {
    setItemTouched(prev => ({ ...prev, [`${itemId}-${field}`]: true }));
  };

  // PO handlers
  const handlePOSelect = (po: PurchaseOrder) => {
    setValue('selectedPO', po._id);
    externalOnSelectPO(po._id);
    setPOSearch(po.orderNumber);
    handleFieldTouch('selectedPO');
  };

  const handlePOClear = () => {
    setValue('selectedPO', '');
    externalOnSelectPO('');
    setPOSearch('');
    handleFieldTouch('selectedPO');
  };

  const handlePOInputChange = (value: string) => {
    if (watchedPO) setValue('selectedPO', '');
    setPOSearch(value);
  };

  // Item update with validation
  const handleItemUpdate = (itemId: string, field: string, value: any, itemIndex: number) => {
    // Validate quantity constraints
    if (field === 'rejectedQuantity' || field === 'damageQuantity') {
      const currentItem = watchedItems[itemIndex];
      const maxAllowed = currentItem.receivedQuantity || 0;
      const numValue = Number(value) || 0;
      
      if (numValue > maxAllowed) {
        // Show error but still update? Better to cap it
        value = Math.min(numValue, maxAllowed);
      }
    }
    
    externalOnUpdateItem(itemId, field, value);
    handleItemTouch(itemId, field);
  };

  // Form submit handler
  const onSubmit = (data: GRNFormSchema) => {
    // Mark all fields as touched
    setTouchedFields({
      selectedPO: true,
      receivedBy: true,
      items: true
    });
    
    // Final validation
    const validationErrors = validateForm(data);
    
    if (Object.keys(validationErrors).length > 0) {
      // Show first error
      const firstError = Object.values(validationErrors)[0];
      // You can use toast here if available
      console.log('Validation error:', firstError);
      return;
    }
    
    onCreateGRN();
  };

  // Check if form can be submitted
  const canSubmit = 
    watchedPO &&
    watchedReceivedBy?.trim() &&
    hasReceivedItems &&
    allItemsHaveNotes &&
    !hasItemErrors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Create Goods Received Note
          </DialogTitle>
          <DialogDescription>
            Record items received against a purchase order
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── PO selector + Received By with Validation ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* PO Selection */}
            <div id="po-section" className="space-y-2 scroll-mt-20">
              <Label htmlFor="po" className="flex items-center gap-2">
                Select Purchase Order <span className="text-red-500">*</span>
                {touchedFields.selectedPO && errors.selectedPO && (
                  <span className="text-xs text-red-500 font-normal ml-auto">
                    {errors.selectedPO?.message}
                  </span>
                )}
              </Label>

              <Controller
                name="selectedPO"
                control={control}
                rules={{ required: 'Please select a purchase order' }}
                render={({ field }) => (
                  <div className="relative">
                    <SearchableCombobox<PurchaseOrder>
                      items={availablePOs}
                      inputValue={selectedPOObj ? selectedPOObj.orderNumber : poSearch}
                      isSelected={!!field.value}
                      onInputChange={handlePOInputChange}
                      onSelect={handlePOSelect}
                      onClear={handlePOClear}
                      config={poConfig}
                      placeholder="Search by PO number or supplier..."
                      colorTheme="blue"
                    />
                    
                    {touchedFields.selectedPO && errors.selectedPO && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                )}
              />
              
              <AnimatePresence>
                {touchedFields.selectedPO && errors.selectedPO && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-red-500 flex items-center gap-1 mt-1"
                  >
                    <Info className="h-3 w-3" />
                    {errors.selectedPO?.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Received By */}
            <div id="receivedBy-section" className="space-y-2 scroll-mt-20">
              <Label htmlFor="receivedBy" className="flex items-center gap-2">
                Received By <span className="text-red-500">*</span>
                {touchedFields.receivedBy && errors.receivedBy && (
                  <span className="text-xs text-red-500 font-normal ml-auto">
                    {errors.receivedBy?.message}
                  </span>
                )}
              </Label>
              
              <Controller
                name="receivedBy"
                control={control}
                rules={{ required: 'Receiver name is required' }}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      id="receivedBy"
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        externalOnReceivedByChange(e.target.value);
                        handleFieldTouch('receivedBy');
                      }}
                      onBlur={() => handleFieldTouch('receivedBy')}
                      placeholder="Enter receiver name"
                      className={`border-2 ${
                        touchedFields.receivedBy && errors.receivedBy
                          ? 'border-red-300 bg-red-50 focus:border-red-500'
                          : 'border-blue-100 hover:border-blue-300 focus:border-blue-400'
                      }`}
                    />
                    
                    {touchedFields.receivedBy && errors.receivedBy && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                )}
              />
              
              <AnimatePresence>
                {touchedFields.receivedBy && errors.receivedBy && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-red-500 flex items-center gap-1"
                  >
                    <Info className="h-3 w-3" />
                    {errors.receivedBy?.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Items Error Banner */}
          <AnimatePresence>
            {touchedFields.items && !hasReceivedItems && (
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
                    At least one item must have received quantity
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Please enter received quantity for at least one item
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Items Table with Validation ── */}
          {watchedItems.length > 0 && (
            <div id="items-section" className="space-y-4 scroll-mt-20">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Receiving Items
                {!hasReceivedItems && (
                  <Badge className="bg-red-100 text-red-700 text-xs ml-2">
                    At least one required
                  </Badge>
                )}
              </h3>
              
              <div className={`border-2 rounded-lg overflow-hidden ${
                touchedFields.items && (!hasReceivedItems || hasItemErrors)
                  ? 'border-red-300'
                  : 'border-blue-100'
              }`}>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-cyan-50">
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Product</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">SKU</th>
                      <th className="text-center p-3 font-semibold text-gray-700 text-sm">Ordered</th>
                      <th className="text-center p-3 font-semibold text-gray-700 text-sm">Received *</th>
                      <th className="text-center p-3 font-semibold text-gray-700 text-sm">Accepted</th>
                      <th className="text-center p-3 font-semibold text-gray-700 text-sm">Rejected</th>
                      <th className="text-center p-3 font-semibold text-gray-700 text-sm">Damaged</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Condition</th>
                      <th className="text-left p-3 font-semibold text-gray-700 text-sm">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchedItems.map((item, index) => {
                      const productName = item.productId?.productName ?? item.productName ?? "—";
                      const sku = item.productId?.sku ?? item.sku ?? "—";
                      const itemId = item.purchaseOrderItemId || `item-${index}`;
                      
                      const hasRejectError = (item.rejectedQuantity || 0) > (item.receivedQuantity || 0);
                      const hasDamageError = (item.damageQuantity || 0) > (item.receivedQuantity || 0);
                      const needsNotesForReject = (item.rejectedQuantity || 0) > 0 && !item.notes?.trim();
                      const needsNotesForDamage = (item.damageQuantity || 0) > 0 && !item.notes?.trim();
                      const hasNotesError = needsNotesForReject || needsNotesForDamage;

                      return (
                        <tr key={itemId} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="p-3">
                            <p className="font-medium text-sm">{productName}</p>
                          </td>
                          <td className="p-3">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{sku}</span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              {item.orderedQuantity}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Controller
                              name={`receivingItems.${index}.receivedQuantity`}
                              control={control}
                              rules={{ 
                                required: 'Required',
                                min: 0,
                                max: item.orderedQuantity || 999999
                              }}
                              render={({ field }) => (
                                <div className="relative">
                                  <Input
                                    type="number" 
                                    min="0"
                                    max={item.orderedQuantity}
                                    value={field.value || 0}
                                    onChange={(e) => {
                                      const val = Number(e.target.value) || 0;
                                      field.onChange(val);
                                      handleItemUpdate(itemId, "receivedQuantity", val, index);
                                    }}
                                    onBlur={() => handleItemTouch(itemId, 'receivedQuantity')}
                                    className={`w-20 text-center border-2 ${
                                      field.value > 0
                                        ? 'border-green-300'
                                        : itemTouched[`${itemId}-receivedQuantity`] && field.value === 0
                                          ? 'border-red-300'
                                          : 'border-blue-100'
                                    }`}
                                  />
                                  {itemTouched[`${itemId}-receivedQuantity`] && field.value === 0 && (
                                    <div className="absolute -top-2 -right-2">
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              {item.acceptedQuantity || 0}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Controller
                              name={`receivingItems.${index}.rejectedQuantity`}
                              control={control}
                              render={({ field }) => (
                                <div className="relative">
                                  <Input
                                    type="number" 
                                    min="0" 
                                    max={item.receivedQuantity || 0}
                                    value={field.value || 0}
                                    onChange={(e) => {
                                      const val = Number(e.target.value) || 0;
                                      field.onChange(val);
                                      handleItemUpdate(itemId, "rejectedQuantity", val, index);
                                    }}
                                    className={`w-20 text-center border-2 ${
                                      hasRejectError
                                        ? 'border-red-300 bg-red-50'
                                        : field.value > 0
                                          ? 'border-orange-300'
                                          : 'border-blue-100'
                                    }`}
                                  />
                                  {hasRejectError && (
                                    <div className="absolute -top-2 -right-2">
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            />
                          </td>
                          <td className="p-3">
                            <Controller
                              name={`receivingItems.${index}.damageQuantity`}
                              control={control}
                              render={({ field }) => (
                                <div className="relative">
                                  <Input
                                    type="number" 
                                    min="0" 
                                    max={item.receivedQuantity || 0}
                                    value={field.value || 0}
                                    onChange={(e) => {
                                      const val = Number(e.target.value) || 0;
                                      field.onChange(val);
                                      handleItemUpdate(itemId, "damageQuantity", val, index);
                                    }}
                                    className={`w-20 text-center border-2 ${
                                      hasDamageError
                                        ? 'border-red-300 bg-red-50'
                                        : field.value > 0
                                          ? 'border-orange-300'
                                          : 'border-blue-100'
                                    }`}
                                  />
                                  {hasDamageError && (
                                    <div className="absolute -top-2 -right-2">
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            />
                          </td>
                          <td className="p-3">
                            <Controller
                              name={`receivingItems.${index}.condition`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value || ''}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    handleItemUpdate(itemId, "condition", value, index);
                                  }}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs border-2 border-blue-100">
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="damaged">Damaged</SelectItem>
                                    <SelectItem value="defective">Defective</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </td>
                          <td className="p-3">
                            <Controller
                              name={`receivingItems.${index}.notes`}
                              control={control}
                              render={({ field }) => (
                                <div className="relative">
                                  <Input
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      handleItemUpdate(itemId, "notes", e.target.value, index);
                                    }}
                                    placeholder={hasNotesError ? "Notes required*" : "Optional notes..."}
                                    className={`w-40 text-xs border-2 ${
                                      hasNotesError
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-100'
                                    }`}
                                  />
                                  {hasNotesError && (
                                    <div className="absolute -top-2 -right-2">
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Item-level error summary */}
              <AnimatePresence>
                {hasItemErrors && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-2 bg-amber-50 border border-amber-200 rounded"
                  >
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Please fix item errors: Reject/damage cannot exceed received, and notes required for reject/damage
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Add Manual Product ── */}
          {/* <div className="space-y-2">
            <Label>Add Manual Product</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Part Name</Label>
                <Input
                  id="productName"
                  value={externalNewProduct?.productName}
                  onChange={(e) => externalOnNewProductChange({ ...externalNewProduct, productName: e.target.value })}
                  placeholder="Enter part name"
                  className="border-2 border-blue-100 hover:border-blue-300 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={externalNewProduct?.sku}
                  onChange={(e) => externalOnNewProductChange({ ...externalNewProduct, sku: e.target.value })}
                  placeholder="Enter SKU"
                  className="border-2 border-blue-100 hover:border-blue-300 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderedQuantity">Ordered Quantity</Label>
                <Input
                  id="orderedQuantity"
                  type="number"
                  value={externalNewProduct?.orderedQuantity}
                  onChange={(e) => externalOnNewProductChange({ ...externalNewProduct, orderedQuantity: Number(e.target.value) })}
                  placeholder="Enter ordered quantity"
                  className="border-2 border-blue-100 hover:border-blue-300 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receivedQuantity">Received Quantity</Label>
                <Input
                  id="receivedQuantity"
                  type="number"
                  value={externalNewProduct?.receivedQuantity}
                  onChange={(e) => externalOnNewProductChange({ ...externalNewProduct, receivedQuantity: Number(e.target.value) })}
                  placeholder="Enter received quantity"
                  className="border-2 border-blue-100 hover:border-blue-300 focus:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={externalNewProduct?.unitPrice}
                  onChange={(e) => externalOnNewProductChange({ ...externalNewProduct, unitPrice: Number(e.target.value) })}
                  placeholder="Enter unit price"
                  className="border-2 border-blue-100 hover:border-blue-300 focus:border-blue-400"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={onAddManualProduct}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </div> */}

          {/* ── GRN Notes ── */}
          <div className="space-y-2">
            <Label htmlFor="grnNotes">GRN Notes</Label>
            <Controller
              name="grnNotes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="grnNotes"
                  value={field.value || ''}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    externalOnGRNNotesChange(e.target.value);
                  }}
                  placeholder="Add any notes about this delivery..."
                  className="border-2 border-blue-100 hover:border-blue-300 focus:border-blue-400"
                  rows={3}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className={`bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 ${
                !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create GRN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};