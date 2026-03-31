"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  PackageX, Loader2, Calendar, Info,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrencyStore } from "@/stores/currency.store";


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

interface ReturnFormSchema {
  selectedGRN:  string;
  returnDate:   string;
  returnedBy:   string;
  returnReason: string;
  returnNotes:  string;
  items:        ReturningItem[];
}

export const CreateReturnDialog: React.FC<CreateReturnDialogProps> = ({
  open, onOpenChange,
  selectedGRN: externalSelectedGRN,   onSelectGRN: externalOnSelectGRN,
  returnedBy: externalReturnedBy,     onReturnedByChange: externalOnReturnedByChange,
  returnReason: externalReturnReason, onReturnReasonChange: externalOnReturnReasonChange,
  returnNotes: externalReturnNotes,   onReturnNotesChange: externalOnReturnNotesChange,
  returningItems: externalReturningItems, onUpdateItem: externalOnUpdateItem,
  availableGRNs, onCreateReturn, onCancel,
  isLoadingItems = false,
  returnDate: externalReturnDate, onReturnDateChange: externalOnReturnDateChange,
}) => {
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const currencySymbol = useCurrencyStore((s) => s.currencySymbol);

  const {
    control, handleSubmit, formState: { errors },
    setValue, watch, trigger, reset,
  } = useForm<ReturnFormSchema>({
    mode: "onChange",
    defaultValues: {
      selectedGRN:  externalSelectedGRN  || "",
      returnDate:   externalReturnDate   || "",
      returnedBy:   externalReturnedBy   || "",
      returnReason: externalReturnReason || "",
      returnNotes:  externalReturnNotes  || "",
      items:        externalReturningItems || [],
    },
  });

  const watchedGRN       = watch("selectedGRN");
  const watchedReturnDate = watch("returnDate");
  const watchedReturnedBy = watch("returnedBy");
  const watchedItems      = watch("items");

  useEffect(() => {
    setValue("selectedGRN",  externalSelectedGRN  || "");
    setValue("returnDate",   externalReturnDate   || "");
    setValue("returnedBy",   externalReturnedBy   || "");
    setValue("returnReason", externalReturnReason || "");
    setValue("returnNotes",  externalReturnNotes  || "");
    setValue("items",        externalReturningItems || []);
  }, [
    externalSelectedGRN, externalReturnDate, externalReturnedBy,
    externalReturnReason, externalReturnNotes, externalReturningItems, setValue,
  ]);

  useEffect(() => { if (touchedFields.selectedGRN) trigger("selectedGRN"); }, [watchedGRN,        trigger, touchedFields.selectedGRN]);
  useEffect(() => { if (touchedFields.returnDate)  trigger("returnDate");  }, [watchedReturnDate,  trigger, touchedFields.returnDate]);
  useEffect(() => { if (touchedFields.returnedBy)  trigger("returnedBy");  }, [watchedReturnedBy,  trigger, touchedFields.returnedBy]);

  useEffect(() => {
    if (!open) { reset(); setTouchedFields({}); }
  }, [open, reset]);

  const hasReturnableItems = watchedItems?.some(item => (item.returnQuantity || 0) > 0);
  const allItemsHaveReason = watchedItems?.every(item =>
    (item.returnQuantity || 0) > 0 ? !!(item.returnReason) : true
  );
  const totalReturnValue = watchedItems?.reduce(
    (sum, item) => sum + (item.returnQuantity || 0) * (item.unitPrice || 0), 0
  ) || 0;

  const handleFieldTouch = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    trigger(field as any);
  };

  const onSubmit = () => {
    setTouchedFields({ selectedGRN: true, returnDate: true, returnedBy: true, items: true });
    if (!hasReturnableItems || !allItemsHaveReason) return;
    onCreateReturn();
  };

  const canSubmit =
    watchedGRN && watchedReturnDate && watchedReturnedBy?.trim() &&
    hasReturnableItems && allItemsHaveReason;

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
            Select a GRN and specify rejected / damaged items to return to supplier
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── GRN Selection ─────────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Select GRN to Return From <span className="text-red-500">*</span>
            </Label>
            {availableGRNs.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No returnable GRNs available</p>
                  <p className="text-xs text-amber-600 mt-1">
                    GRNs appear here only when status is "received" and items were marked
                    as rejected or damaged during quality inspection.
                  </p>
                </div>
              </div>
            ) : (
              <Controller
                name="selectedGRN"
                control={control}
                rules={{ required: "Please select a GRN" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      externalOnSelectGRN(value);
                      handleFieldTouch("selectedGRN");
                    }}
                  >
                    <SelectTrigger className={`border-2 ${
                      touchedFields.selectedGRN && errors.selectedGRN
                        ? "border-red-300 bg-red-50"
                        : "border-[#fed7aa] hover:border-orange-400"
                    }`}>
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
                              <span>
                                {grn.purchaseOrderId?.supplier?.contactInformation?.primaryContactName || "Unknown Supplier"}
                              </span>
                              <Badge className="bg-red-100 text-red-700 text-xs ml-1">
                                {returnableCount} rejected/damaged
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            <AnimatePresence>
              {touchedFields.selectedGRN && errors.selectedGRN && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-500 flex items-center gap-1 mt-1"
                >
                  <Info className="h-3 w-3" />{errors.selectedGRN?.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {watchedGRN && (
            <>
              {/* ── Return Details ──────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Return Date */}
                <div className="space-y-2">
                  <Label htmlFor="returnDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    Return Date <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="returnDate"
                    control={control}
                    rules={{ required: "Return date is required" }}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="returnDate" type="date"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            externalOnReturnDateChange(e.target.value);
                            handleFieldTouch("returnDate");
                          }}
                          onBlur={() => handleFieldTouch("returnDate")}
                          max={new Date().toISOString().split("T")[0]}
                          className={`border-2 ${
                            touchedFields.returnDate && errors.returnDate
                              ? "border-red-300 bg-red-50"
                              : "border-[#fed7aa] focus:border-orange-500"
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
                  <p className="text-xs text-gray-500">Cannot be a future date</p>
                </div>

                {/* Returned By */}
                <div className="space-y-2">
                  <Label htmlFor="returnedBy" className="flex items-center gap-2">
                    Returned By <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="returnedBy"
                    control={control}
                    rules={{ required: "Returned by is required" }}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          id="returnedBy"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            externalOnReturnedByChange(e.target.value);
                            handleFieldTouch("returnedBy");
                          }}
                          onBlur={() => handleFieldTouch("returnedBy")}
                          placeholder="Enter name of person processing return"
                          className={`border-2 ${
                            touchedFields.returnedBy && errors.returnedBy
                              ? "border-red-300 bg-red-50"
                              : "border-[#fed7aa] focus:border-orange-500"
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
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <Info className="h-3 w-3" />{errors.returnedBy?.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* General Return Reason */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="returnReason">General Return Reason</Label>
                  <Controller
                    name="returnReason"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="returnReason"
                        value={field.value}
                        onChange={(e) => { field.onChange(e.target.value); externalOnReturnReasonChange(e.target.value); }}
                        placeholder="e.g., Quality issues, Wrong delivery, Damaged on arrival"
                        className="border-2 border-[#fed7aa] focus:border-orange-500"
                      />
                    )}
                  />
                </div>
              </div>

              {/* ── Items Section ──────────────────────────────────────────── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    Items to Return <span className="text-red-500">*</span>
                    {!hasReturnableItems && (
                      <Badge className="bg-red-100 text-red-700 text-xs">At least one item required</Badge>
                    )}
                  </Label>
                  <span className="text-xs text-gray-500">Max qty = rejected + damaged</span>
                </div>

                <AnimatePresence>
                  {touchedFields.items && !hasReturnableItems && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3"
                    >
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-800">At least one item must have return quantity</p>
                        <p className="text-xs text-red-600 mt-0.5">Please set return quantity for at least one item</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`border-2 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto ${
                  touchedFields.items && !hasReturnableItems ? "border-red-300 bg-red-50/30" : "border-[#fed7aa]"
                }`}>
                  {isLoadingItems && (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />Loading items...
                    </div>
                  )}

                  {!isLoadingItems && watchedItems?.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No returnable items found for this GRN.
                    </div>
                  )}

                  {!isLoadingItems && watchedItems?.map((item, index) => {
                    // receivedQuantity = rejected + damaged - alreadyReturned (set by hook)
                    const maxQty      = item.receivedQuantity ?? 0;
                    const rejectedQty = (item as any).rejectedQuantity ?? 0;
                    const damagedQty  = (item as any).damageQuantity   ?? 0;

                    return (
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
                                ? "border-red-300 bg-red-50/50"
                                : "border-gray-200"
                            }`}
                          >
                            {/* Item header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{item.productName}</p>
                                <p className="text-sm text-gray-500 font-mono">SKU: {item.sku}</p>
                                {/* Accepted / Rejected / Damaged breakdown */}
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                                    ✓ {item.acceptedQuantity ?? 0} accepted
                                  </span>
                                  {rejectedQty > 0 && (
                                    <span className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                                      ✗ {rejectedQty} rejected
                                    </span>
                                  )}
                                  {damagedQty > 0 && (
                                    <span className="text-xs text-orange-600 font-semibold bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
                                      ⚠ {damagedQty} damaged
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    — max returnable: <strong>{maxQty}</strong>
                                  </span>
                                </div>
                              </div>
                              <Badge className="bg-indigo-100 text-indigo-700 shrink-0">
                                {currencySymbol}{item.unitPrice?.toFixed(2) || "0.00"} / unit
                              </Badge>
                            </div>

                            {/* Qty + Reason */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                  Return Quantity
                                  <span className="text-gray-400">(max: {maxQty})</span>
                                  {item.returnQuantity > 0 && (
                                    <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
                                  )}
                                </Label>
                                <Input
                                  type="number" min="0" max={maxQty}
                                  value={item.returnQuantity}
                                  onChange={(e) => {
                                    const value = Math.min(parseInt(e.target.value) || 0, maxQty);
                                    field.onChange({ ...item, returnQuantity: value });
                                    externalOnUpdateItem(item._id, "returnQuantity", value);
                                    setTouchedFields(prev => ({ ...prev, items: true }));
                                  }}
                                  className={`border-2 ${
                                    item.returnQuantity > 0
                                      ? "border-green-300 focus:border-green-500"
                                      : "border-[#fed7aa] focus:border-orange-500"
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
                                      ? "border-red-300 bg-red-50"
                                      : "border-[#fed7aa]"
                                  }`}>
                                    <SelectValue placeholder="Select reason..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="damaged">Damaged</SelectItem>
                                    <SelectItem value="defective">Defective</SelectItem>
                                    <SelectItem value="wrong-item">Wrong Item</SelectItem>
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
                                value={item.condition || ""}
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
                                  Return Value: {currencySymbol}{(item.returnQuantity * item.unitPrice).toFixed(2)}
                                </p>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Controller
                  name="returnNotes"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      value={field.value}
                      onChange={(e) => { field.onChange(e.target.value); externalOnReturnNotesChange(e.target.value); }}
                      placeholder="Any additional notes about this return..."
                      className="border-2 border-[#fed7aa] focus:border-orange-500 min-h-20"
                    />
                  )}
                />
              </div>

              {/* Total Summary */}
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
                        {currencySymbol}{totalReturnValue.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
            <Button
              type="submit"
              disabled={!canSubmit || isLoadingItems}
              className={`bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 ${
                (!canSubmit || isLoadingItems) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoadingItems
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                : <><PackageX className="h-4 w-4 mr-2" />Create Return Note</>
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};