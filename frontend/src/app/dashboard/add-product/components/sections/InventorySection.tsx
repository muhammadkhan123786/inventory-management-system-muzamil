// components/steps/variant-sections/InventorySection.tsx
//
// Validation model based on SAP WM / Oracle WMS / NetSuite inventory standards.
//
// The golden chain that must never be violated:
//   0  ≤  safetyStock  <  minLevel  ≤  reorderPoint  <  maxLevel
//   stockQty ≤ maxLevel   (stock can never exceed physical capacity)
//
// ZONES (SAP "stock monitor" model):
//   Danger Zone   : 0 → safetyStock        🔴 Emergency
//   Operating Zone: safetyStock → reorder  🟢 Normal
//   Excess Zone   : reorder → maxLevel     🟡 Slow down purchasing

import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/form/Input";
import {
  PackageCheck,
  Warehouse,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  AlertCircle,
  CheckCircle2,
  Ban,
  Info,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/form/Select";
import { useState, useCallback, useMemo } from "react";
import {
  SearchableCombobox,
  ComboboxItemConfig,
} from "@/components/SearchableCombobox";
import { useFormActions } from "@/hooks/useFormActions";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Supplier {
  _id: string;
  supplierName: string;
  contactEmail?: string;
  phone?: string;
  code?: string;
}

interface ValidationResult {
  field: string;
  message: string;
  severity: "error" | "warning";
}

interface InventorySectionProps {
  currentVariant: any;
  warehouses: any[];
  warehouseStatus: any[];
  productStatus: any[];
  conditions: any[];
  onVariantFieldChange: (field: string, value: any) => void;
  supplierApiUrl?: string;
  /** When true (after "Add Variant" clicked), force all validation errors visible */
  forceShowErrors?: boolean;
}

// ─── Supplier combobox config ──────────────────────────────────────────────────
const supplierConfig: ComboboxItemConfig<Supplier> = {
  getKey: (s) => s._id,
  getLabel: (s) => s.supplierName,
  getSubLabel: (s) => s.contactEmail || s.phone || "",
  getRightLabel: (s) => s.code ?? "",
  getSearchFields: (s) =>
    [s.supplierName, s.contactEmail, s.phone, s.code].filter(
      Boolean,
    ) as string[],
};

// ─── 10-Rule Enterprise Validation Engine ─────────────────────────────────────
//
// Rules sourced from SAP MM / Oracle WMS / NetSuite inventory management docs.
//
export function validateInventory(
  stockQty: number,
  safetyStock: number,
  minLevel: number,
  reorderPoint: number,
  maxLevel: number,
  leadTimeDays: number,
  avgDailySales: number = 0,
): ValidationResult[] {
  const errors: ValidationResult[] = [];

  // RULE 1 — stockQty ≥ 0 (physical impossibility)
  if (stockQty < 0) {
    errors.push({
      field: "stockQuantity",
      severity: "error",
      message: "Stock quantity cannot be negative.",
    });
  }

  // RULE 2 — safetyStock ≥ 0
  if (safetyStock < 0) {
    errors.push({
      field: "safetyStock",
      severity: "error",
      message: "Safety stock cannot be negative.",
    });
  }

  // RULE 3 — minLevel > safetyStock  [HARD]
  // "Min level is the alert threshold; it must sit above the buffer so there's
  //  still usable stock before the emergency reserve is touched." — SAP MM docs
  if (safetyStock > 0 && minLevel > 0 && minLevel <= safetyStock) {
    errors.push({
      field: "minStockLevel",
      severity: "error",
      message:
        `Min level (${minLevel}) must be greater than safety stock (${safetyStock}). ` +
        `Min level is the first alert; safety stock is the last-resort buffer.`,
    });
  }

  // RULE 4 — reorderPoint ≥ minLevel  [HARD]
  // "Reordering must be triggered before or exactly when stock hits min level,
  //  never after — otherwise you're already in a low-stock state." — Oracle WMS
  if (reorderPoint > 0 && minLevel > 0 && reorderPoint < minLevel) {
    errors.push({
      field: "reorderPoint",
      severity: "error",
      message:
        `Reorder point (${reorderPoint}) must be ≥ min level (${minLevel}). ` +
        `Reorder should trigger before stock drops to the alert threshold.`,
    });
  }

  // RULE 5 — maxLevel > reorderPoint  [HARD]
  // "Placing a purchase order when you're already at max capacity is wasteful
  //  and indicates a misconfiguration." — NetSuite Best Practices
  if (maxLevel > 0 && reorderPoint > 0 && maxLevel <= reorderPoint) {
    errors.push({
      field: "maxStockLevel",
      severity: "error",
      message:
        `Max level (${maxLevel}) must be greater than reorder point (${reorderPoint}). ` +
        `There must be headroom to receive a replenishment order.`,
    });
  }

  // RULE 6 — stockQty ≤ maxLevel  [HARD]
  // "Physical stock cannot exceed bin/location capacity." — Manhattan Associates WMS
  // NOTE: maxLevel BEING GREATER than stockQty is NORMAL and expected (Walmart DC example).
  // This rule only fires if stock somehow exceeded the declared capacity.
  if (maxLevel > 0 && stockQty > maxLevel) {
    errors.push({
      field: "stockQuantity",
      severity: "error",
      message:
        `Current stock (${stockQty}) exceeds max capacity (${maxLevel}). ` +
        `Either reduce stock or increase max level. (e.g. Walmart DC: capacity 500, stock 180 = ✅ normal)`,
    });
  }

  // RULE 7 — reorderPoint > safetyStock  [SOFT WARN]
  // Formula coherence check — reorder triggers well before emergency buffer is touched
  if (reorderPoint > 0 && safetyStock > 0 && reorderPoint <= safetyStock) {
    errors.push({
      field: "reorderPoint",
      severity: "warning",
      message:
        `Reorder point (${reorderPoint}) ≤ safety stock (${safetyStock}). ` +
        `You'd be ordering in emergency territory. Consider raising reorder point.`,
    });
  }

  // RULE 8 — Headroom check: maxLevel − reorderPoint ≥ reorderPoint − safetyStock  [SOFT WARN]
  // "The receive-zone (reorder→max) should be at least as large as the operate-zone
  //  (safety→reorder) to ensure one full replenishment cycle fits." — SAP IBP
  if (maxLevel > 0 && reorderPoint > 0 && safetyStock >= 0) {
    const receiveZone = maxLevel - reorderPoint;
    const operateZone = reorderPoint - safetyStock;
    if (receiveZone < operateZone) {
      errors.push({
        field: "maxStockLevel",
        severity: "warning",
        message:
          `Receive headroom (${receiveZone} units) is smaller than operating range (${operateZone} units). ` +
          `Consider raising max level so a full reorder batch fits.`,
      });
    }
  }

  // RULE 9 — minLevel ≥ safetyStock × 1.5  [SOFT WARN]
  // "Industry guideline: min alert threshold should provide at least 50% buffer
  //  above safety stock to allow reaction time." — Oracle SCM Cloud Docs
  if (minLevel > 0 && safetyStock > 0 && minLevel < safetyStock * 1.5) {
    errors.push({
      field: "minStockLevel",
      severity: "warning",
      message:
        `Min level (${minLevel}) is close to safety stock (${safetyStock}). ` +
        `Recommended: min level ≥ ${Math.ceil(safetyStock * 1.5)} (1.5× safety stock) for reaction time.`,
    });
  }

  // RULE 10 — Lead-time coherence: reorderPoint ≥ safetyStock + (avgDailySales × leadTimeDays)  [SOFT WARN]
  // "Classic reorder point formula used by Amazon, Zara, and most large retailers." — APICS CPIM
  // reorderPoint = (avgDailyUsage × leadTime) + safetyStock
  if (leadTimeDays > 0 && avgDailySales > 0) {
    const minReorderPoint = safetyStock + avgDailySales * leadTimeDays;
    if (reorderPoint > 0 && reorderPoint < minReorderPoint) {
      errors.push({
        field: "reorderPoint",
        severity: "warning",
        message:
          `Formula check (Amazon/Zara model): reorder point should be ≥ ${Math.ceil(minReorderPoint)} ` +
          `(safety stock ${safetyStock} + daily sales ${avgDailySales} × lead time ${leadTimeDays} days). ` +
          `At current reorder point you may stock out before replenishment arrives.`,
      });
    }
  }

  return errors;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getFieldErrors(field: string, errors: ValidationResult[]) {
  return errors.filter((e) => e.field === field);
}
function hasError(field: string, errors: ValidationResult[]) {
  return errors.some((e) => e.field === field && e.severity === "error");
}
function hasWarning(field: string, errors: ValidationResult[]) {
  return errors.some((e) => e.field === field && e.severity === "warning");
}

function inputBorder(
  field: string,
  errors: ValidationResult[],
  defaultCls: string,
) {
  if (hasError(field, errors))
    return "border-2 border-red-400   focus:border-red-500   bg-red-50/40";
  if (hasWarning(field, errors))
    return "border-2 border-amber-400 focus:border-amber-500 bg-amber-50/30";
  return defaultCls;
}

// ─── FieldFeedback component ───────────────────────────────────────────────────
function FieldFeedback({
  field,
  errors,
  hint,
}: {
  field: string;
  errors: ValidationResult[];
  hint?: string;
}) {
  const fieldErrors = getFieldErrors(field, errors);
  if (fieldErrors.length === 0) {
    return hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null;
  }
  return (
    <div className="mt-1.5 space-y-1">
      {fieldErrors.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-start gap-1.5 text-xs font-medium ${e.severity === "error" ? "text-red-600" : "text-amber-600"
            }`}
        >
          {e.severity === "error" ? (
            <Ban className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          )}
          <span>{e.message}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── 3-Zone Stock Visualiser ───────────────────────────────────────────────────
function ZoneVisualiser({
  stockQty,
  safetyStock,
  minLevel,
  reorderPoint,
  maxLevel,
}: {
  stockQty: number;
  safetyStock: number;
  minLevel: number;
  reorderPoint: number;
  maxLevel: number;
}) {
  if (maxLevel <= 0) return null;

  const pct = (val: number) =>
    Math.min(100, Math.max(0, (val / maxLevel) * 100));
  const safetyPct = pct(safetyStock);
  const reorderPct = pct(reorderPoint);
  const currentPct = pct(stockQty);

  // Determine which zone the current stock is in
  const zone =
    stockQty <= safetyStock
      ? {
        label: "Danger Zone",
        color: "text-red-700",
        bg: "bg-red-100 border-red-300",
      }
      : stockQty <= reorderPoint
        ? {
          label: "Operating Zone",
          color: "text-emerald-700",
          bg: "bg-emerald-50 border-emerald-200",
        }
        : {
          label: "Excess Zone",
          color: "text-amber-700",
          bg: "bg-amber-50 border-amber-200",
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white border-2 border-gray-200 rounded-xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-blue-500" />
          3-Zone Stock Model
          <span className="font-normal text-gray-400">(SAP / Oracle WMS)</span>
        </p>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${zone.bg} ${zone.color}`}
        >
          {zone.label}
        </span>
      </div>

      {/* Zone bar */}
      <div className="relative h-6 w-full rounded-full overflow-hidden bg-gray-100">
        {/* Danger zone — 0 to safetyStock */}
        <div
          className="absolute top-0 left-0 h-full bg-red-300/60"
          style={{ width: `${safetyPct}%` }}
        />
        {/* Operating zone — safetyStock to reorderPoint */}
        <div
          className="absolute top-0 h-full bg-emerald-300/60"
          style={{ left: `${safetyPct}%`, width: `${reorderPct - safetyPct}%` }}
        />
        {/* Excess zone — reorderPoint to maxLevel */}
        <div
          className="absolute top-0 h-full bg-amber-300/60"
          style={{ left: `${reorderPct}%`, width: `${100 - reorderPct}%` }}
        />
        {/* Current stock marker */}
        <motion.div
          className="absolute top-0 h-full w-1 bg-blue-600 shadow-lg"
          style={{ left: `${currentPct}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4 }}
        />
        {/* Labels inside bar */}
        <div className="absolute inset-0 flex items-center justify-around px-1">
          <span className="text-[9px] font-bold text-red-700 z-10">
            🔴 Danger
          </span>
          <span className="text-[9px] font-bold text-emerald-700 z-10">
            🟢 Operating
          </span>
          <span className="text-[9px] font-bold text-amber-700 z-10">
            🟡 Excess
          </span>
        </div>
      </div>

      {/* Legend pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        {safetyStock > 0 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200 font-semibold">
            Safety {safetyStock}
          </span>
        )}
        {minLevel > 0 && (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full border border-orange-200 font-semibold">
            Min {minLevel}
          </span>
        )}
        {reorderPoint > 0 && (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 font-semibold">
            Reorder {reorderPoint}
          </span>
        )}
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200 font-semibold">
          Current {stockQty}
        </span>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200 font-semibold">
          Max {maxLevel}
        </span>
      </div>

      {/* Zone explanation */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-bold text-red-700 mb-0.5">🔴 Danger Zone</p>
          <p className="text-red-600">0 → {safetyStock || "Safety"}</p>
          <p className="text-gray-500 mt-0.5">
            Emergency reorder. Flag account manager.
          </p>
        </div>
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="font-bold text-emerald-700 mb-0.5">🟢 Operating Zone</p>
          <p className="text-emerald-600">
            {safetyStock || "Safety"} → {reorderPoint || "Reorder"}
          </p>
          <p className="text-gray-500 mt-0.5">
            Normal operations. Watch reorder point.
          </p>
        </div>
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="font-bold text-amber-700 mb-0.5">🟡 Excess Zone</p>
          <p className="text-amber-600">
            {reorderPoint || "Reorder"} → {maxLevel}
          </p>
          <p className="text-gray-500 mt-0.5">
            Pause purchasing. Consider promotions.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function InventorySection({
  currentVariant,
  warehouses = [],
  warehouseStatus = [],
  productStatus = [],
  conditions = [],
  onVariantFieldChange,
  supplierApiUrl = "/suppliers",
  forceShowErrors = false,
}: InventorySectionProps) {
  // ── Parse all values ──────────────────────────────────────────────────
  const stockQty = Math.max(
    0,
    parseInt(currentVariant.stockQuantity || "0") || 0,
  );
  const safetyStock = Math.max(
    0,
    parseInt(currentVariant.safetyStock || "0") || 0,
  );
  const minLevel = Math.max(
    0,
    parseInt(currentVariant.minStockLevel || "0") || 0,
  );
  const reorderPoint = Math.max(
    0,
    parseInt(currentVariant.reorderPoint || "0") || 0,
  );
  const maxLevel = Math.max(
    0,
    parseInt(currentVariant.maxStockLevel || "0") || 0,
  );
  const leadTimeDays = Math.max(
    0,
    parseInt(currentVariant.leadTimeDays || "0") || 0,
  );
  const avgDailySales = Math.max(
    0,
    parseFloat(currentVariant.avgDailySales || "0") || 0,
  );

  // ── Run validation engine ─────────────────────────────────────────────
  const validationErrors = useMemo(
    () =>
      validateInventory(
        stockQty,
        safetyStock,
        minLevel,
        reorderPoint,
        maxLevel,
        leadTimeDays,
        avgDailySales,
      ),
    [
      stockQty,
      safetyStock,
      minLevel,
      reorderPoint,
      maxLevel,
      leadTimeDays,
      avgDailySales,
    ],
  );

  const blockingErrors = validationErrors.filter((e) => e.severity === "error");
  const warnings = validationErrors.filter((e) => e.severity === "warning");

  // ── Supplier lazy load ────────────────────────────────────────────────
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierInput, setSupplierInput] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(
    () => {
      // Initialize from currentVariant if supplier exists
      if (currentVariant.supplierId) {
        console.log("Initializing selected supplier from variant:", currentVariant);
        return {
          _id: currentVariant.supplierId,

        };
      }
      return null;
    }
  );

  console.log("selectedSupplier:", selectedSupplier);

  const { data: templates } = useFormActions<any>(
    "/suppliers",
    "suppliers",
    "Suppliers",
  );

  const handleSupplierFirstOpen = useCallback(() => {
    if (!Array.isArray(templates)) {
      console.log("Templates not ready:", templates);
      return;
    }

    if (suppliers.length > 0) return;

    try {
      setSuppliersLoading(true);

      console.log("Raw supplier templates:", templates);

      const formattedSuppliers: Supplier[] = templates.map((s: any) => {
        console.log("Formatting supplier in loop:", s);

        return {
          _id: s._id,
          supplierName:
            s?.contactInformation?.primaryContactName || "Unnamed Supplier",
          contactEmail: s?.contactInformation?.emailAddress || "",
          phone: s?.contactInformation?.phoneNumber || "",
          code: s?.contactInformation?.businessRegNumber || "",
        };
      });

      console.log("Formatted suppliers:", formattedSuppliers);

      setSuppliers(formattedSuppliers);
    } catch (err) {
      console.error("Supplier formatting error:", err);
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  }, [templates, suppliers.length]);

  const handleSupplierSelect = (s: Supplier) => {
    setSelectedSupplier(s);
    setSupplierInput(s.supplierName);
    onVariantFieldChange("supplierId", s._id);
    onVariantFieldChange("supplierName", s.supplierName);
  };
  const handleSupplierClear = () => {
    setSelectedSupplier(null);
    setSupplierInput("");
    onVariantFieldChange("supplierId", "");
    onVariantFieldChange("supplierName", "");
  };

  // ── Stock status (same as original) ──────────────────────────────────
  const isLowStock = minLevel > 0 && stockQty < minLevel;
  const isCritical = reorderPoint > 0 && stockQty <= reorderPoint;
  const isOverstocked = maxLevel > 0 && stockQty > maxLevel;
  const isOptimal =
    minLevel > 0 &&
    maxLevel > 0 &&
    stockQty >= minLevel &&
    stockQty <= maxLevel;

  const getStockStatus = () => {
    if (stockQty === 0)
      return {
        label: "Out of Stock",
        color: "from-red-500 to-rose-600",
        icon: AlertTriangle,
      };
    if (isCritical)
      return {
        label: "Critical",
        color: "from-red-500 to-orange-600",
        icon: AlertTriangle,
      };
    if (isLowStock)
      return {
        label: "Low Stock",
        color: "from-orange-500 to-amber-600",
        icon: TrendingDown,
      };
    if (isOverstocked)
      return {
        label: "Overstocked",
        color: "from-purple-500 to-pink-600",
        icon: TrendingUp,
      };
    if (isOptimal)
      return {
        label: "Optimal",
        color: "from-green-500 to-emerald-600",
        icon: PackageCheck,
      };
    return {
      label: "Normal",
      color: "from-blue-500 to-cyan-600",
      icon: Package,
    };
  };

  const getStatusDotColor = (label: string) => {
    const t = label.toLowerCase();
    if (t.includes("in stock") || t.includes("available"))
      return "bg-green-500";
    if (t.includes("out of stock")) return "bg-red-500";
    if (t.includes("low stock")) return "bg-yellow-500";
    if (t.includes("reserved")) return "bg-blue-500";
    return "bg-purple-500";
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const stockUtilization =
    maxLevel > 0 ? Math.min((stockQty / maxLevel) * 100, 100) : 0;

  // ── Suggested reorder point (Rule 10 formula) ─────────────────────────
  const suggestedReorderPoint =
    leadTimeDays > 0 && avgDailySales > 0
      ? Math.ceil(safetyStock + avgDailySales * leadTimeDays)
      : null;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── Blocking errors banner ── */}
      <AnimatePresence>
        {blockingErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-red-50 border-2 border-red-300 rounded-lg space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-700">
                {blockingErrors.length} stock configuration error
                {blockingErrors.length > 1 ? "s" : ""} — fix before saving
              </p>
            </div>
            {blockingErrors.map((e, i) => (
              <p key={i} className="text-xs text-red-600 pl-6">
                • {e.message}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Required fields missing banner (shown after submit attempt) ── */}
      <AnimatePresence>
        {forceShowErrors &&
          (() => {
            const missing: string[] = [];
            if (!currentVariant.stockQuantity) missing.push("Stock Quantity");
            if (!currentVariant.minStockLevel) missing.push("Min Stock Level");
            if (!currentVariant.maxStockLevel) missing.push("Max Stock Level");
            if (!currentVariant.reorderPoint) missing.push("Reorder Point");
            if (!currentVariant.safetyStock) missing.push("Safety Stock");
            if (!currentVariant.leadTimeDays) missing.push("Lead Time (Days)");
            if (!currentVariant.stockLocation) missing.push("Stock Location");
            if (!currentVariant.conditionId) missing.push("Item Condition");
            if (!currentVariant.productStatusId) missing.push("Product Status");
            return missing.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 bg-red-50 border-2 border-red-400 rounded-lg space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-red-700">
                    {missing.length} required field
                    {missing.length > 1 ? "s" : ""} missing in Inventory
                  </p>
                </div>
                {missing.map((f, i) => (
                  <p key={i} className="text-xs text-red-600 pl-6">
                    • {f} is required
                  </p>
                ))}
              </motion.div>
            ) : null;
          })()}
      </AnimatePresence>

      {/* ── Warnings banner ── */}
      <AnimatePresence>
        {warnings.length > 0 && blockingErrors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs font-bold text-amber-700">
                {warnings.length} advisory warning
                {warnings.length > 1 ? "s" : ""} (can save, but review
                recommended)
              </p>
            </div>
            {warnings.map((e, i) => (
              <p key={i} className="text-xs text-amber-700 pl-6">
                • {e.message}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stock Quantity ── */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Stock Quantity <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          min="0"
          value={currentVariant.stockQuantity}
          onChange={(e) =>
            onVariantFieldChange("stockQuantity", e.target.value)
          }
          placeholder="0"
          className={
            forceShowErrors && !currentVariant.stockQuantity
              ? "border-2 border-red-400 bg-red-50/40 focus:border-red-500"
              : inputBorder(
                "stockQuantity",
                validationErrors,
                "border-2 border-blue-200 focus:border-blue-500",
              )
          }
        />
        {forceShowErrors && !currentVariant.stockQuantity && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Stock Quantity is
            required
          </p>
        )}
        <FieldFeedback
          field="stockQuantity"
          errors={validationErrors}
          hint="Current on-hand stock (physical count)"
        />

        {/* Live status */}
        {stockQty > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {stockStatus.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stockStatus.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stockUtilization}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {stockUtilization.toFixed(0)}%
                </span>
              </div>
            </div>
            {stockQty === 0 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                ⚠️ Out of Stock — immediate action required!
              </div>
            )}
            {isCritical && stockQty > 0 && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                ⚠️ Critical — reorder immediately!
              </div>
            )}
            {isLowStock && !isCritical && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                ⚠️ Low Stock — consider reordering
              </div>
            )}
            {isOverstocked && (
              <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                ⚠️ Overstocked — consider reducing stock
              </div>
            )}
            {isOptimal && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                ✅ Stock Level Optimal
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Safety Stock ── */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Safety Stock
          <span className="ml-1 text-gray-400 font-normal text-[11px]">
            (Rule 3: must be &lt; min level)
          </span>
        </label>
        <Input
          type="number"
          min="0"
          value={currentVariant.safetyStock || ""}
          onChange={(e) => onVariantFieldChange("safetyStock", e.target.value)}
          placeholder="Buffer for demand spikes"
          className={inputBorder(
            "safetyStock",
            validationErrors,
            "border-2 border-teal-200 focus:border-teal-500",
          )}
        />
        <FieldFeedback
          field="safetyStock"
          errors={validationErrors}
          hint={`Emergency buffer — last-resort stock before stockout. Formula: Z × σ_demand × √lead_time (SAP MM).${minLevel > 0 ? ` Must stay below min level (${minLevel}).` : ""}`}
        />
      </div>

      {/* ── Min / Max / Reorder ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Min Stock Level */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Minimum Stock Level
            {safetyStock > 0 && (
              <span className="ml-1 text-xs text-blue-500 font-normal">
                (must be &gt; {safetyStock})
              </span>
            )}
          </label>
          <Input
            type="number"
            min="0"
            value={currentVariant.minStockLevel}
            onChange={(e) =>
              onVariantFieldChange("minStockLevel", e.target.value)
            }
            placeholder="0"
            className={inputBorder(
              "minStockLevel",
              validationErrors,
              "border-2 border-red-200 focus:border-red-500",
            )}
          />
          <FieldFeedback
            field="minStockLevel"
            errors={validationErrors}
            hint="Alert fires when stock hits this level. Must be above safety stock."
          />
        </div>

        {/* Reorder Point */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reorder Point
            {minLevel > 0 && maxLevel > 0 && (
              <span className="ml-1 text-xs text-blue-500 font-normal">
                ({minLevel}–{maxLevel})
              </span>
            )}
          </label>
          <Input
            type="number"
            min="0"
            value={currentVariant.reorderPoint}
            onChange={(e) =>
              onVariantFieldChange("reorderPoint", e.target.value)
            }
            placeholder="0"
            className={inputBorder(
              "reorderPoint",
              validationErrors,
              "border-2 border-amber-200 focus:border-amber-500",
            )}
          />
          <FieldFeedback
            field="reorderPoint"
            errors={validationErrors}
            hint={
              suggestedReorderPoint
                ? `Suggested: ${suggestedReorderPoint} (safety ${safetyStock} + ${avgDailySales}/day × ${leadTimeDays} days)`
                : "Place purchase order when stock hits this level."
            }
          />
          {suggestedReorderPoint && reorderPoint !== suggestedReorderPoint && (
            <button
              type="button"
              onClick={() =>
                onVariantFieldChange(
                  "reorderPoint",
                  String(suggestedReorderPoint),
                )
              }
              className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Apply suggested: {suggestedReorderPoint}
            </button>
          )}
        </div>

        {/* Max Stock Level */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Maximum Stock Level
            {reorderPoint > 0 && (
              <span className="ml-1 text-xs text-blue-500 font-normal">
                (must be &gt; {reorderPoint})
              </span>
            )}
          </label>
          <Input
            type="number"
            min="0"
            value={currentVariant.maxStockLevel}
            onChange={(e) =>
              onVariantFieldChange("maxStockLevel", e.target.value)
            }
            placeholder="0"
            className={inputBorder(
              "maxStockLevel",
              validationErrors,
              "border-2 border-green-200 focus:border-green-500",
            )}
          />
          <FieldFeedback
            field="maxStockLevel"
            errors={validationErrors}
            hint={
              stockQty > 0
                ? `Bin/location capacity ceiling. Current stock ${stockQty} must not exceed this.`
                : "Bin/location physical capacity. e.g. Walmart DC: capacity 500, stock 180 = normal."
            }
          />
        </div>
      </div>

      {/* ── 3-Zone Visualiser ── */}
      <AnimatePresence>
        {maxLevel > 0 && (
          <ZoneVisualiser
            stockQty={stockQty}
            safetyStock={safetyStock}
            minLevel={minLevel}
            reorderPoint={reorderPoint}
            maxLevel={maxLevel}
          />
        )}
      </AnimatePresence>
      {/* ── Supplier ── */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
          <Truck className="h-4 w-4 text-teal-600" />
          Supplier
        </label>
        <SearchableCombobox<Supplier>
          items={suppliers}
          inputValue={supplierInput}
          isSelected={!!selectedSupplier}
          onInputChange={setSupplierInput}
          onSelect={handleSupplierSelect}
          onClear={handleSupplierClear}
          onFirstOpen={handleSupplierFirstOpen}
          config={supplierConfig}
          placeholder="Search supplier…"
          isLoading={suppliersLoading}
          colorTheme="teal"
        />
        {selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-teal-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium">{selectedSupplier.supplierName}</span>
            {selectedSupplier.contactEmail && (
              <span className="text-gray-400">
                · {selectedSupplier.contactEmail}
              </span>
            )}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Stock Location ── */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Stock Location (Aisle/Shelf)
          </label>
          <Input
            value={currentVariant.stockLocation}
            onChange={(e) =>
              onVariantFieldChange("stockLocation", e.target.value)
            }
            placeholder="e.g., Aisle 3, Shelf B"
            className="border-2 border-amber-200 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Lead Time (Days)
          </label>
          <Input
            type="number"
            min="0"
            value={currentVariant.leadTimeDays || ""}
            onChange={(e) =>
              onVariantFieldChange("leadTimeDays", e.target.value)
            }
            placeholder="e.g., 7"
            className="border-2 border-blue-200 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Days for replenishment to arrive
          </p>
        </div>
      </div>

      {/* ── Warehouse & Bin Location ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-blue-600" />
            Warehouse
          </label>
          <Select
            value={currentVariant.warehouseId}
            onValueChange={(v) => onVariantFieldChange("warehouseId", v)}
          >
            <SelectTrigger className="border-2 border-blue-200 focus:border-blue-500">
              <SelectValue placeholder="Select warehouse..." />
            </SelectTrigger>
            <SelectContent>
              {warehouses.length > 0 ? (
                warehouses.map((w) => (
                  <SelectItem key={w.value} value={w.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{w.label}</span>
                      {w.code && (
                        <span className="text-xs text-gray-500">
                          ({w.code})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-warehouses" disabled>
                  No warehouses configured
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Bin Location
          </label>
          <Input
            value={currentVariant.binLocation}
            onChange={(e) =>
              onVariantFieldChange("binLocation", e.target.value)
            }
            placeholder="e.g., A-12-03"
            className="border-2 border-yellow-200 focus:border-yellow-500"
          />
        </div>
      </div>

      {/* ── Product Status / Condition / Warehouse Status ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-green-600" /> Product Status
          </label>
          <Select
            value={currentVariant.productStatusId}
            onValueChange={(v) => onVariantFieldChange("productStatusId", v)}
          >
            <SelectTrigger className="border-2 border-green-200 focus:border-green-500">
              <SelectValue placeholder="Select product status..." />
            </SelectTrigger>
            <SelectContent>
              {productStatus.length > 0 ? (
                productStatus.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-product-status" disabled>
                  No product status configured
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-600" /> Item Condition
          </label>
          <Select
            value={currentVariant.conditionId}
            onValueChange={(v) => onVariantFieldChange("conditionId", v)}
          >
            <SelectTrigger className="border-2 border-red-200 focus:border-red-500">
              <SelectValue placeholder="Select condition..." />
            </SelectTrigger>
            <SelectContent>
              {conditions.length > 0 ? (
                conditions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-conditions" disabled>
                  No conditions configured
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-orange-600" /> Warehouse
            Status
          </label>
          <Select
            value={currentVariant.warehouseStatusId || ""}
            onValueChange={(v) => onVariantFieldChange("warehouseStatusId", v)}
          >
            <SelectTrigger className="border-2 border-orange-200 focus:border-orange-500">
              <SelectValue placeholder="Select warehouse status..." />
            </SelectTrigger>
            <SelectContent>
              {warehouseStatus.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusDotColor(s.label)}`}
                    />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Featured ── */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
        <input
          type="checkbox"
          checked={currentVariant.featured || false}
          onChange={(e) => onVariantFieldChange("featured", e.target.checked)}
          className="h-5 w-5 rounded border-2 border-orange-300 text-orange-600 focus:ring-2 focus:ring-orange-200"
        />
        <div>
          <label className="text-sm font-medium text-gray-700 cursor-pointer block">
            Featured Product
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Display prominently on storefront and promotions
          </p>
        </div>
      </div>

      {/* ── Stock Status Dashboard ── */}
      {stockQty > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-orange-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-orange-900 flex items-center gap-2">
              <StockIcon className="h-5 w-5" />
              Stock Status Dashboard
            </h3>
            <div
              className={`px-3 py-1 rounded-full bg-gradient-to-r ${stockStatus.color} text-white text-xs font-bold`}
            >
              {stockStatus.label}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: "Safety Stock",
                value: safetyStock || "—",
                border: "border-teal-200",
                text: "text-teal-700",
              },
              {
                label: "Min Level",
                value: minLevel || "—",
                border: "border-red-200",
                text: "text-red-700",
              },
              {
                label: "Current",
                value: stockQty,
                border: "border-blue-200",
                text: "text-blue-900 font-extrabold",
              },
              {
                label: "Reorder At",
                value: reorderPoint || "—",
                border: "border-amber-200",
                text: "text-amber-700",
              },
              {
                label: "Max Level",
                value: maxLevel || "—",
                border: `border ${hasError("maxStockLevel", validationErrors) ? "border-red-400 bg-red-50/60" : "border-green-200"}`,
                text: hasError("maxStockLevel", validationErrors)
                  ? "text-red-600"
                  : "text-green-700",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`bg-white/50 backdrop-blur-sm p-3 rounded-lg border ${item.border}`}
              >
                <p className="text-xs text-gray-600">{item.label}</p>
                <p className={`text-lg font-bold ${item.text}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function getStatusDotColor(label: string) {
  const t = label.toLowerCase();
  if (t.includes("in stock") || t.includes("available")) return "bg-green-500";
  if (t.includes("out of stock")) return "bg-red-500";
  if (t.includes("low stock")) return "bg-yellow-500";
  if (t.includes("reserved")) return "bg-blue-500";
  return "bg-purple-500";
}
