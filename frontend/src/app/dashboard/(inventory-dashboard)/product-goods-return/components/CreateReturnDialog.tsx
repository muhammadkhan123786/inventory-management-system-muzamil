"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/form/Dialog";
import { Button }   from "@/components/form/CustomButton";
import { Input }    from "@/components/form/Input";
import { Label }    from "@/components/form/Label";
import { Badge }    from "@/components/form/Badge";
import { Textarea } from "@/components/form/Textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/form/Select";
import { Card, CardContent } from "@/components/form/Card";
import { GRNForReturn, ReturningItem } from "../types/goodsReturn";
import { PackageX, Loader2, Calendar, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateReturnDialogProps {
  open: boolean;
  onOpenChange:         (open: boolean) => void;
  selectedGRN:          string;
  onSelectGRN:          (grnId: string) => void;
  returnedBy:           string;
  onReturnedByChange:   (value: string) => void;
  returnReason:         string;
  onReturnReasonChange: (value: string) => void;
  returnNotes:          string;
  onReturnNotesChange:  (value: string) => void;
  returningItems:       ReturningItem[];
  onUpdateItem:         (itemId: string, field: string, value: any) => void;
  availableGRNs:        GRNForReturn[];
  onCreateReturn:       () => void;
  onCancel:             () => void;
  isLoadingItems?:      boolean;
  returnDate:           string;
  onReturnDateChange:   (value: string) => void;
}

// Form validation interface
interface ReturnFormSchema {
  selectedGRN: string;
  returnDate: string;
  returnedBy: string;
  returnReason: string;
  returnNotes: string;
  items: ReturningItem[];
}

export const CreateReturnDialog: React.FC<CreateReturnDialogProps> = ({
  open, onOpenChange, selectedGRN: externalSelectedGRN, onSelectGRN: externalOnSelectGRN,
  returnedBy: externalReturnedBy, onReturnedByChange: externalOnReturnedByChange,
  returnReason: externalReturnReason, onReturnReasonChange: externalOnReturnReasonChange,
  returnNotes: externalReturnNotes, onReturnNotesChange: externalOnReturnNotesChange,
  returningItems: externalReturningItems, onUpdateItem: externalOnUpdateItem,
  availableGRNs, onCreateReturn, onCancel,
  isLoadingItems = false, returnDate: externalReturnDate, onReturnDateChange: externalOnReturnDateChange,
}) => {
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // ─── React Hook Form Setup ─────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<ReturnFormSchema>({
    mode: 'onChange',
    defaultValues: {
      selectedGRN: externalSelectedGRN || '',
      returnDate: externalReturnDate || '',
      returnedBy: externalReturnedBy || '',
      returnReason: externalReturnReason || '',
      returnNotes: externalReturnNotes || '',
      items: externalReturningItems || []
    }
  });

  // Watch values for real-time validation
  const watchedGRN = watch('selectedGRN');
  const watchedReturnDate = watch('returnDate');
  const watchedReturnedBy = watch('returnedBy');
  const watchedItems = watch('items');

  // Update form when external props change
  useEffect(() => {
    setValue('selectedGRN', externalSelectedGRN || '');
    setValue('returnDate', externalReturnDate || '');
    setValue('returnedBy', externalReturnedBy || '');
    setValue('returnReason', externalReturnReason || '');
    setValue('returnNotes', externalReturnNotes || '');
    setValue('items', externalReturningItems || []);
  }, [
    externalSelectedGRN, externalReturnDate, externalReturnedBy,
    externalReturnReason, externalReturnNotes, externalReturningItems,
    setValue
  ]);

  // Trigger validation when fields change
  useEffect(() => {
    if (touchedFields.selectedGRN) trigger('selectedGRN');
  }, [watchedGRN, trigger, touchedFields.selectedGRN]);

  useEffect(() => {
    if (touchedFields.returnDate) trigger('returnDate');
  }, [watchedReturnDate, trigger, touchedFields.returnDate]);

  useEffect(() => {
    if (touchedFields.returnedBy) trigger('returnedBy');
  }, [watchedReturnedBy, trigger, touchedFields.returnedBy]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset();
      setTouchedFields({});
    }
  }, [open, reset]);

  // Calculate if any item has return quantity > 0
  const hasReturnableItems = watchedItems?.some(item => (item.returnQuantity || 0) > 0);
  
  // Check if all items with quantity > 0 have reason selected
  const allItemsHaveReason = watchedItems?.every(item => {
    if ((item.returnQuantity || 0) > 0) {
      return item.returnReason && item.returnReason !== '';
    }
    return true;
  });

  // Calculate total return value
  const totalReturnValue = watchedItems?.reduce(
    (sum, item) => sum + (item.returnQuantity || 0) * (item.unitPrice || 0), 0
  ) || 0;

  // Form validation rules
  const validateForm = (data: ReturnFormSchema) => {
    const errors: Record<string, string> = {};
    
    if (!data.selectedGRN) {
      errors.selectedGRN = 'Please select a GRN';
    }
    
    if (!data.returnDate) {
      errors.returnDate = 'Return date is required';
    }
    
    if (!data.returnedBy?.trim()) {
      errors.returnedBy = 'Returned by is required';
    }
    
    const itemsWithQuantity = data.items?.filter(item => (item.returnQuantity || 0) > 0) || [];
    
    if (itemsWithQuantity.length === 0) {
      errors.items = 'At least one item must have return quantity > 0';
    }
    
    itemsWithQuantity.forEach((item, index) => {
      if (!item.returnReason) {
        errors[`items.${index}.returnReason`] = 'Return reason is required for items with quantity';
      }
    });
    
    return errors;
  };

  // Handle field touch
  const handleFieldTouch = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    trigger(field as any);
  };

  // Form submit handler
  const onSubmit = (data: ReturnFormSchema) => {
    // Mark all fields as touched
    setTouchedFields({
      selectedGRN: true,
      returnDate: true,
      returnedBy: true,
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
    
    onCreateReturn();
  };

  // Check if form can be submitted
  const canSubmit = 
    watchedGRN &&
    watchedReturnDate &&
    watchedReturnedBy?.trim() &&
    hasReturnableItems &&
    allItemsHaveReason;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <PackageX className="h-4 w-4 text-white" />
            </div>
            Create Goods Return Note
          </DialogTitle>
          <DialogDescription>
            Select a GRN and specify items to return to supplier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ── GRN Selection with Validation ──────────────────────────────── */}
          <div id="grn-section" className="space-y-2 scroll-mt-20">
            <Label className="flex items-center gap-2">
              Select GRN to Return From <span className="text-red-500">*</span>
              {touchedFields.selectedGRN && errors.selectedGRN && (
                <span className="text-xs text-red-500 font-normal ml-auto">
                  {errors.selectedGRN?.message}
                </span>
              )}
            </Label>
            
            {availableGRNs.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No returnable GRNs available</p>
                  <p className="text-xs text-amber-600 mt-1">
                    GRNs appear here only when: (1) status is "received", (2) items were accepted into stock,
                    and (3) those items haven't been fully returned yet.
                  </p>
                </div>
              </div>
            ) : (
              <Controller
                name="selectedGRN"
                control={control}
                rules={{ required: 'Please select a GRN' }}
                render={({ field }) => (
                  <div className="relative">
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        externalOnSelectGRN(value);
                        handleFieldTouch('selectedGRN');
                      }}
                    >
                      <SelectTrigger 
                        className={`border-2 ${
                          touchedFields.selectedGRN && errors.selectedGRN
                            ? 'border-red-300 bg-red-50'
                            : 'border-[#fed7aa] hover:border-orange-400'
                        }`}
                      >
                        <SelectValue placeholder="Select a Goods Received Note..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGRNs.map(grn => {
                          const returnableCount = grn.items.filter(
                            (i: any) => (i.returnableQty ?? 0) > 0
                          ).length;
                          return (
                            <SelectItem key={grn.id} value={grn.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">{grn.grnNumber}</span>
                                <span className="text-gray-500">—</span>
                                <span>{grn.purchaseOrderId?.supplier?.contactInformation?.primaryContactName || "Unknown Supplier"}</span>
                                <Badge className="bg-orange-100 text-orange-700 text-xs ml-1">
                                  {returnableCount} returnable
                                </Badge>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    
                    {touchedFields.selectedGRN && errors.selectedGRN && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                )}
              />
            )}
            
            <AnimatePresence>
              {touchedFields.selectedGRN && errors.selectedGRN && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-500 flex items-center gap-1 mt-1"
                >
                  <Info className="h-3 w-3" />
                  {errors.selectedGRN?.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {watchedGRN && (
            <>
              {/* ── Return Details with Validation ─────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Return Date */}
                <div id="return-date-section" className="space-y-2 scroll-mt-20">
                  <Label htmlFor="returnDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    Return Date <span className="text-red-500">*</span>
                    {touchedFields.returnDate && errors.returnDate && (
                      <span className="text-xs text-red-500 font-normal ml-auto">
                        {errors.returnDate?.message}
                      </span>
                    )}
                  </Label>
                  
                  <Controller
                    name="returnDate"
                    control={control}
                    rules={{ required: 'Return date is required' }}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="returnDate"
                          type="date"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            externalOnReturnDateChange(e.target.value);
                            handleFieldTouch('returnDate');
                          }}
                          onBlur={() => handleFieldTouch('returnDate')}
                          max={new Date().toISOString().split("T")[0]}
                          className={`border-2 ${
                            touchedFields.returnDate && errors.returnDate
                              ? 'border-red-300 bg-red-50 focus:border-red-500'
                              : 'border-[#fed7aa] focus:border-orange-500'
                          }`}
                        />
                        
                        {touchedFields.returnDate && errors.returnDate && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    )}
                  />
                  
                  <AnimatePresence>
                    {touchedFields.returnDate && errors.returnDate && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <Info className="h-3 w-3" />
                        {errors.returnDate?.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <p className="text-xs text-gray-500">Cannot be a future date</p>
                </div>

                {/* Returned By */}
                <div id="returned-by-section" className="space-y-2 scroll-mt-20">
                  <Label htmlFor="returnedBy" className="flex items-center gap-2">
                    Returned By <span className="text-red-500">*</span>
                    {touchedFields.returnedBy && errors.returnedBy && (
                      <span className="text-xs text-red-500 font-normal ml-auto">
                        {errors.returnedBy?.message}
                      </span>
                    )}
                  </Label>
                  
                  <Controller
                    name="returnedBy"
                    control={control}
                    rules={{ required: 'Returned by is required' }}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="returnedBy"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            externalOnReturnedByChange(e.target.value);
                            handleFieldTouch('returnedBy');
                          }}
                          onBlur={() => handleFieldTouch('returnedBy')}
                          placeholder="Enter name of person processing return"
                          className={`border-2 ${
                            touchedFields.returnedBy && errors.returnedBy
                              ? 'border-red-300 bg-red-50 focus:border-red-500'
                              : 'border-[#fed7aa] focus:border-orange-500'
                          }`}
                        />
                        
                        {touchedFields.returnedBy && errors.returnedBy && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                      </div>
                    )}
                  />
                  
                  <AnimatePresence>
                    {touchedFields.returnedBy && errors.returnedBy && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <Info className="h-3 w-3" />
                        {errors.returnedBy?.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Return Reason */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="returnReason">General Return Reason</Label>
                  <Controller
                    name="returnReason"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="returnReason"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          externalOnReturnReasonChange(e.target.value);
                        }}
                        placeholder="e.g., Quality issues, Wrong delivery, Excess stock"
                        className="border-2 border-[#fed7aa] focus:border-orange-500"
                      />
                    )}
                  />
                </div>
              </div>

              {/* ── Items with Validation ───────────────────────────────────── */}
              <div id="items-section" className="space-y-2 scroll-mt-20">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    Items to Return <span className="text-red-500">*</span>
                    {!hasReturnableItems && (
                      <Badge className="bg-red-100 text-red-700 text-xs">
                        At least one item required
                      </Badge>
                    )}
                  </Label>
                  <span className="text-xs text-gray-500">
                    Max qty = accepted stock − already returned
                  </span>
                </div>

                {/* Items Error Banner */}
                <AnimatePresence>
                  {touchedFields.items && !hasReturnableItems && (
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
                          At least one item must have return quantity
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                          Please set return quantity for at least one item
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`border-2 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto ${
                  touchedFields.items && !hasReturnableItems
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-[#fed7aa]'
                }`}>
                  {isLoadingItems && (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Loading items...
                    </div>
                  )}

                  {!isLoadingItems && watchedItems?.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No returnable items found for this GRN.
                    </div>
                  )}

                  {!isLoadingItems && watchedItems?.map((item, index) => (
                    <Controller
                      key={item._id}
                      name={`items.${index}`}
                      control={control}
                      render={({ field }) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`bg-gray-50 rounded-lg p-4 space-y-3 hover:bg-gray-100 transition-colors border ${
                            item.returnQuantity > 0 && !item.returnReason
                              ? 'border-red-300 bg-red-50/50'
                              : 'border-gray-200'
                          }`}
                        >
                          {/* Item header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-500 font-mono">SKU: {item.sku}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-green-600 font-medium">
                                  ✓ {item.acceptedQuantity ?? item.receivedQuantity} accepted
                                </span>
                                <span className="text-xs text-orange-600 font-semibold">
                                  ↩ {item.receivedQuantity} returnable
                                </span>
                              </div>
                            </div>
                            <Badge className="bg-indigo-100 text-indigo-700">
                              £{item.unitPrice?.toFixed(2) || "0.00"} / unit
                            </Badge>
                          </div>

                          {/* Qty + Reason */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-medium flex items-center gap-1">
                                Return Quantity
                                <span className="text-gray-400">(max: {item.receivedQuantity})</span>
                                {item.returnQuantity > 0 && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
                                )}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max={item.receivedQuantity}
                                value={item.returnQuantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  field.onChange({ ...item, returnQuantity: value });
                                  externalOnUpdateItem(item._id, "returnQuantity", value);
                                  setTouchedFields(prev => ({ ...prev, items: true }));
                                }}
                                className={`border-2 ${
                                  item.returnQuantity > 0
                                    ? 'border-green-300 focus:border-green-500'
                                    : 'border-[#fed7aa] focus:border-orange-500'
                                }`}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs font-medium flex items-center gap-1">
                                Return Reason 
                                {item.returnQuantity > 0 && <span className="text-red-500">*</span>}
                                {item.returnQuantity > 0 && !item.returnReason && (
                                  <span className="text-xs text-red-500 ml-auto">Required</span>
                                )}
                                {item.returnQuantity > 0 && item.returnReason && (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
                                )}
                              </Label>
                              <Select
                                value={item.returnReason}
                                onValueChange={(value) => {
                                  field.onChange({ ...item, returnReason: value });
                                  externalOnUpdateItem(item._id, "returnReason", value);
                                }}
                              >
                                <SelectTrigger className={`border-2 ${
                                  item.returnQuantity > 0 && !item.returnReason
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-[#fed7aa]'
                                }`}>
                                  <SelectValue placeholder="Select reason..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="damaged">Damaged</SelectItem>
                                  <SelectItem value="defective">Defective</SelectItem>
                                  <SelectItem value="wrong-item">Wrong Item</SelectItem>
                                  <SelectItem value="excess">Excess Quantity</SelectItem>
                                  <SelectItem value="quality-issue">Quality Issue</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Notes / Condition</Label>
                            <Textarea
                              value={item.condition || ''}
                              onChange={(e) => {
                                field.onChange({ ...item, condition: e.target.value });
                                externalOnUpdateItem(item._id, "condition", e.target.value);
                              }}
                              placeholder="Describe condition, damage, or reason..."
                              className="border-2 border-[#fed7aa] focus:border-orange-500 min-h-16"
                            />
                          </div>

                          {/* Return Value */}
                          {item.returnQuantity > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-orange-50 border border-orange-200 rounded p-2"
                            >
                              <p className="text-sm font-medium text-orange-900">
                                Return Value: £{(item.returnQuantity * item.unitPrice).toFixed(2)}
                              </p>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Controller
                  name="returnNotes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        externalOnReturnNotesChange(e.target.value);
                      }}
                      placeholder="Any additional notes about this return..."
                      className="border-2 border-[#fed7aa] focus:border-orange-500 min-h-20"
                    />
                  )}
                />
              </div>

              {/* Total summary */}
              {hasReturnableItems && (
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Total Return Value</p>
                        <p className="text-xs text-orange-600 mt-1">
                          {watchedItems?.filter(i => i.returnQuantity > 0).length} item(s) selected
                          — awaiting manager approval after submit
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-orange-900">
                        £{totalReturnValue.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isLoadingItems}
              className={`bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 ${
                (!canSubmit || isLoadingItems) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoadingItems ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <PackageX className="h-4 w-4 mr-2" />
                  Create Return Note
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};