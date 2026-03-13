// components/steps/variant-sections/PricingSection.tsx
//
// Professional validation approach (SAP / Stripe / Shopify pattern):
//   ✅ Allow free typing at all times — never block keystrokes
//   ✅ Show errors on blur (after user leaves the field) OR on submit attempt
//   ✅ Block the "Add Marketplace Pricing" BUTTON when errors exist
//   ✅ Parent receives `hasErrors` via `onValidationChange` to gate the add action

import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/form/Input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/form/Select";
import {
  DollarSign, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Tag, ShieldCheck, Percent, Info,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PricingError {
  message: string;
  severity: "error" | "warning";
}

interface PricingSectionProps {
  currentVariant: {
    costPrice?: number | string;
    sellingPrice?: number | string;
    retailPrice?: number | string;
    discountPercentage?: number | string;
    taxId?: string;
    taxRate?: number | string;
    vatExempt?: boolean;
  };
  currencySymbol?: string;
  taxes: { value: string; label: string; rate?: number }[];
  onVariantFieldChange: (field: string, value: any) => void;
  onTaxChange: (taxId: string) => void;
  onVatExemptChange: (checked: boolean) => void;
  /** Parent uses this to gate the "Add Pricing" button */
  onValidationChange?: (hasErrors: boolean) => void;
}

// ─── Inline field message ─────────────────────────────────────────────────────
function FieldMessage({ error }: { error?: PricingError }) {
  if (!error) return null;
  const isError = error.severity === "error";
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -4, height: 0 }}
        transition={{ duration: 0.15 }}
        className={`mt-1.5 flex items-start gap-1.5 text-xs font-medium ${isError ? "text-red-600" : "text-amber-600"
          }`}
      >
        <AlertCircle className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isError ? "text-red-500" : "text-amber-500"}`} />
        <span>{error.message}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Border class (visual feedback only — never blocks input) ─────────────────
function fieldBorder(touched: boolean, error?: PricingError, defaultCls: string = "") {
  if (!touched) return defaultCls;
  if (error?.severity === "error") return "border-2 border-red-400   focus:border-red-500   bg-red-50/20";
  if (error?.severity === "warning") return "border-2 border-amber-400 focus:border-amber-500 bg-amber-50/20";
  return defaultCls.replace(/border-\S+/g, "") + " border-2 border-emerald-400 focus:border-emerald-500";
}

// ─── Pure validation functions (no side effects) ──────────────────────────────
function validateCostPrice(val: number): PricingError | undefined {
  if (val < 0) return { severity: "error", message: "Cost price cannot be negative." };
  return undefined;
}

function validateSellingPrice(selling: number, cost: number): PricingError | undefined {
  if (selling <= 0) return undefined; // not filled yet — no error
  if (cost > 0 && selling < cost)
    return {
      severity: "error",
      message: `Selling price (${selling.toFixed(2)}) is below cost price (${cost.toFixed(2)}). You would sell at a loss.`,
    };
  if (cost > 0 && selling === cost)
    return {
      severity: "warning",
      message: "Selling price equals cost price — break-even with zero profit margin.",
    };
  return undefined;
}

function validateRetailPrice(retail: number, selling: number): PricingError | undefined {
  if (retail <= 0) return undefined;
  if (selling > 0 && retail < selling)
    return {
      severity: "error",
      message: `Retail / RRP price (${retail.toFixed(2)}) is below selling price (${selling.toFixed(2)}). RRP should be ≥ selling price.`,
    };
  return undefined;
}

function validateDiscount(val: number): PricingError | undefined {
  if (val < 0) return { severity: "error", message: "Discount cannot be negative." };
  if (val > 100) return { severity: "error", message: "Discount cannot exceed 100%." };
  if (val > 50) return { severity: "warning", message: "Discount above 50% — verify this is intentional." };
  return undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PricingSection({
  currentVariant,
  currencySymbol = "£",
  taxes = [],
  onVariantFieldChange,
  onTaxChange,
  onVatExemptChange,
  onValidationChange,
}: PricingSectionProps) {

  // ── Parsed live values ────────────────────────────────────────────────
  const costPrice = parseFloat(String(currentVariant.costPrice || "0")) || 0;
  const sellingPrice = parseFloat(String(currentVariant.sellingPrice || "0")) || 0;
  const retailPrice = parseFloat(String(currentVariant.retailPrice || "0")) || 0;
  const discount = parseFloat(String(currentVariant.discountPercentage || "0")) || 0;

  // ── "touched" tracks which fields the user has visited ───────────────
  // Errors only show AFTER the user has left a field (blur), not while typing.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched(p => ({ ...p, [field]: true }));

  // ── Run validation on every render (derived, not state) ───────────────
  const costError = validateCostPrice(costPrice);
  const sellingError = validateSellingPrice(sellingPrice, costPrice);
  const retailError = validateRetailPrice(retailPrice, sellingPrice);
  const discountError = validateDiscount(discount);

  const allErrors = [costError, sellingError, retailError, discountError].filter(
    (e): e is PricingError => e?.severity === "error"
  );
  const hasErrors = allErrors.length > 0;

  // ── Notify parent whenever error state changes ────────────────────────
  useEffect(() => {
    onValidationChange?.(hasErrors);
  }, [hasErrors, onValidationChange]);

  // ── Derived profit metrics ────────────────────────────────────────────
  const profit = sellingPrice - costPrice;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markup = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  const discountedSell = sellingPrice * (1 - discount / 100);
  const profitAfterDiscount = discountedSell - costPrice;
  const isProfitable = profit > 0;
  const isBreakEven = profit === 0 && sellingPrice > 0 && costPrice > 0;
  const isLoss = costPrice > 0 && sellingPrice > 0 && profit < 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Pricing conflict banner (shows after fields are touched) ── */}
      <AnimatePresence>
        {hasErrors && Object.keys(touched).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-3 bg-red-50 border-2 border-red-300 rounded-lg"
          >
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-700 mb-1">
                Pricing conflicts must be resolved before adding this marketplace
              </p>
              {allErrors.map((e, i) => (
                <p key={i} className="text-xs text-red-600">• {e.message}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cost & Selling Price ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Cost Price */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-gray-500" />
            Cost Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium z-10">
              {currencySymbol}
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={currentVariant.costPrice || ""}
              onChange={(e) => onVariantFieldChange("costPrice", e.target.value)}
              onBlur={() => touch("costPrice")}
              placeholder="0.00"
              className={`pl-7 ${fieldBorder(!!touched.costPrice, costError, "border-2 border-gray-200 focus:border-gray-400")}`}
            />
          </div>
          <FieldMessage error={touched.costPrice ? costError : undefined} />
          {!touched.costPrice && (
            <p className="text-xs text-gray-500 mt-1">Your purchase / production cost</p>
          )}
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
            Selling Price <span className="text-red-500">*</span>
            {costPrice > 0 && (
              <span className="text-[11px] text-blue-500 font-normal ml-1">
                (min: {currencySymbol}{costPrice.toFixed(2)})
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium z-10">
              {currencySymbol}
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={currentVariant.sellingPrice || ""}
              onChange={(e) => onVariantFieldChange("sellingPrice", e.target.value)}
              onBlur={() => touch("sellingPrice")}
              placeholder={costPrice > 0 ? `≥ ${costPrice.toFixed(2)}` : "0.00"}
              className={`pl-7 ${fieldBorder(!!touched.sellingPrice, sellingError, "border-2 border-green-200 focus:border-green-500")}`}
            />
          </div>
          <FieldMessage error={touched.sellingPrice ? sellingError : undefined} />
          {(!touched.sellingPrice || !sellingError) && !sellingError && (
            <p className="text-xs text-gray-500 mt-1">
              {costPrice > 0
                ? `Must be ≥ cost price (${currencySymbol}${costPrice.toFixed(2)})`
                : "Price charged to customers"}
            </p>
          )}
        </div>
      </div>

      {/* ── Live profit / margin indicator ── */}
      <AnimatePresence>
        {sellingPrice > 0 && costPrice > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-3 rounded-xl border-2 ${isLoss ? "bg-red-50    border-red-200"
              : isBreakEven ? "bg-blue-50   border-blue-200"
                : "bg-emerald-50 border-emerald-200"
              }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {isLoss ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : isBreakEven ? (
                  <Info className="h-4 w-4 text-blue-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                )}
                <span className={`text-xs font-bold ${isLoss ? "text-red-700" : isBreakEven ? "text-blue-700" : "text-emerald-700"
                  }`}>
                  {isLoss ? "Selling at a loss" : isBreakEven ? "Break-even" : "Profitable"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs flex-wrap">
                <span>
                  <span className="text-gray-500">Profit: </span>
                  <span className={`font-bold ${profit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {currencySymbol}{profit.toFixed(2)}
                  </span>
                </span>
                <span>
                  <span className="text-gray-500">Margin: </span>
                  <span className={`font-bold ${margin >= 20 ? "text-emerald-700" : margin >= 0 ? "text-amber-600" : "text-red-600"
                    }`}>
                    {margin.toFixed(1)}%
                  </span>
                </span>
                <span>
                  <span className="text-gray-500">Markup: </span>
                  <span className={`font-bold ${markup >= 0 ? "text-blue-700" : "text-red-600"}`}>
                    {markup.toFixed(1)}%
                  </span>
                </span>
                {discount > 0 && sellingPrice > 0 && (
                  <span>
                    <span className="text-gray-500">After {discount}% off: </span>
                    <span className={`font-bold ${profitAfterDiscount >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {currencySymbol}{profitAfterDiscount.toFixed(2)}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Margin quality bar */}
            {!isLoss && margin > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                  <span>0%</span>
                  <span className="text-amber-600">10% (low)</span>
                  <span className="text-emerald-600">20%+ (healthy)</span>
                  <span>50%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${margin >= 20 ? "bg-emerald-500" : margin >= 10 ? "bg-amber-400" : "bg-red-400"
                      }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(margin * 2, 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Retail Price & Discount ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Retail / RRP Price */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-purple-500" />
            Retail / RRP Price
            {sellingPrice > 0 && (
              <span className="text-[11px] text-blue-500 font-normal ml-1">
                (min: {currencySymbol}{sellingPrice.toFixed(2)})
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium z-10">
              {currencySymbol}
            </span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={currentVariant.retailPrice || ""}
              onChange={(e) => onVariantFieldChange("retailPrice", e.target.value)}
              onBlur={() => touch("retailPrice")}
              placeholder={sellingPrice > 0 ? `≥ ${sellingPrice.toFixed(2)}` : "0.00"}
              className={`pl-7 ${fieldBorder(!!touched.retailPrice, retailError, "border-2 border-purple-200 focus:border-purple-500")}`}
            />
          </div>
          <FieldMessage error={touched.retailPrice ? retailError : undefined} />
          {(!touched.retailPrice || !retailError) && (
            <p className="text-xs text-gray-500 mt-1">
              {sellingPrice > 0
                ? `Must be ≥ selling price (${currencySymbol}${sellingPrice.toFixed(2)})`
                : "Manufacturer / recommended retail price"}
            </p>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-orange-500" />
            Discount Percentage
          </label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={currentVariant.discountPercentage || ""}
              onChange={(e) => onVariantFieldChange("discountPercentage", e.target.value)}
              onBlur={() => touch("discount")}
              placeholder="0"
              className={`pr-7 ${fieldBorder(!!touched.discount, discountError, "border-2 border-orange-200 focus:border-orange-500")}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
              %
            </span>
          </div>
          <FieldMessage error={touched.discount ? discountError : undefined} />
          {!discountError && discount > 0 && sellingPrice > 0 && (
            <p className="text-xs text-emerald-600 mt-1">
              Customer pays: {currencySymbol}{discountedSell.toFixed(2)}
            </p>
          )}
          {!discount && (
            <p className="text-xs text-gray-500 mt-1">Applied on selling price (0–100%)</p>
          )}
        </div>
      </div>

      {/* ── Tax ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            Tax
          </label>
          <Select
            value={currentVariant.taxId || ""}
            onValueChange={onTaxChange}
            disabled={currentVariant.vatExempt}
          >
            <SelectTrigger
              className={`border-2 border-blue-200 focus:border-blue-500 ${currentVariant.vatExempt ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              <SelectValue placeholder="Select tax..." />
            </SelectTrigger>
            <SelectContent>
              {taxes.length > 0 ? (
                taxes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                    {t.rate !== undefined && (
                      <span className="ml-2 text-xs text-gray-400">({t.rate}%)</span>
                    )}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-taxes" disabled>No taxes configured</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tax Rate (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={currentVariant.taxRate || ""}
            onChange={(e) => onVariantFieldChange("taxRate", e.target.value)}
            placeholder="0.00"
            disabled={currentVariant.vatExempt}
            className={`border-2 border-blue-200 focus:border-blue-500 ${currentVariant.vatExempt ? "opacity-50 cursor-not-allowed" : ""
              }`}
          />
        </div>
      </div>

      {/* ── VAT Exempt ── */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
        <input
          type="checkbox"
          id="vatExempt"
          checked={currentVariant.vatExempt || false}
          onChange={(e) => onVatExemptChange(e.target.checked)}
          className="h-5 w-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
        />
        <div>
          <label htmlFor="vatExempt" className="text-sm font-medium text-gray-700 cursor-pointer block">
            VAT Exempt
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            This product is exempt from VAT. Tax fields will be disabled.
          </p>
        </div>
        {currentVariant.vatExempt && (
          <span className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
            Exempt
          </span>
        )}
      </div>
    </div>
  );
}

export default PricingSection;