// components/steps/variant-sections/InventorySection.tsx
//
// INFO-ONLY INVENTORY SECTION
// All messages are informational only - NO blocking, NO warnings
// Green theme for all info messages

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
  Info,
  Lightbulb,
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

interface InfoMessage {
  field: string;
  message: string;
  type: "info" | "suggestion";
}

interface InventorySectionProps {
  currentVariant: any;
  warehouses: any[];
  warehouseStatus: any[];
  productStatus: any[];
  conditions: any[];
  onVariantFieldChange: (field: string, value: any) => void;
  supplierApiUrl?: string;
  /** When true, show all info messages */
  forceShowErrors?: boolean;
  /** When true, inventory is info-only mode */
  isInfoOnly?: boolean;
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

// ─── Info Engine (INFORMATIONAL ONLY - Green themed) ──────────────────────────
export function getInventoryInfoMessages(
  stockQty: number,
  safetyStock: number,
  minLevel: number,
  reorderPoint: number,
  maxLevel: number,
  leadTimeDays: number,
  avgDailySales: number = 0,
): InfoMessage[] {
  const messages: InfoMessage[] = [];

  // Rule 1 — stockQty ≥ 0
  if (stockQty < 0) {
    messages.push({
      field: "stockQuantity",
      type: "info",
      message: "Stock quantity should not be negative. Please enter a valid number.",
    });
  }

  // Rule 2 — safetyStock ≥ 0
  if (safetyStock < 0) {
    messages.push({
      field: "safetyStock",
      type: "info",
      message: "Safety stock should not be negative.",
    });
  }

  // Rule 3 — minLevel > safetyStock
  if (safetyStock > 0 && minLevel > 0 && minLevel <= safetyStock) {
    messages.push({
      field: "minStockLevel",
      type: "suggestion",
      message: `💡 For better inventory management, consider setting min level (${minLevel}) above safety stock (${safetyStock}).`,
    });
  }

  // Rule 4 — reorderPoint ≥ minLevel
  if (reorderPoint > 0 && minLevel > 0 && reorderPoint < minLevel) {
    messages.push({
      field: "reorderPoint",
      type: "suggestion",
      message: `💡 Consider setting reorder point (${reorderPoint}) at or above min level (${minLevel}) to trigger reordering appropriately.`,
    });
  }

  // Rule 5 — maxLevel > reorderPoint
  if (maxLevel > 0 && reorderPoint > 0 && maxLevel <= reorderPoint) {
    messages.push({
      field: "maxStockLevel",
      type: "suggestion",
      message: `💡 Consider setting max level (${maxLevel}) above reorder point (${reorderPoint}) to have room for new stock.`,
    });
  }

  // Rule 6 — stockQty ≤ maxLevel
  if (maxLevel > 0 && stockQty > maxLevel) {
    messages.push({
      field: "stockQuantity",
      type: "info",
      message: `ℹ️ Current stock (${stockQty}) exceeds max capacity (${maxLevel}). You may want to adjust these values.`,
    });
  }

  // Rule 7 — reorderPoint > safetyStock
  if (reorderPoint > 0 && safetyStock > 0 && reorderPoint <= safetyStock) {
    messages.push({
      field: "reorderPoint",
      type: "suggestion",
      message: `💡 Reorder point (${reorderPoint}) is at or below safety stock (${safetyStock}). Consider raising reorder point.`,
    });
  }

  // Rule 8 — Headroom check
  if (maxLevel > 0 && reorderPoint > 0 && safetyStock >= 0) {
    const receiveZone = maxLevel - reorderPoint;
    const operateZone = reorderPoint - safetyStock;
    if (receiveZone < operateZone && operateZone > 0) {
      messages.push({
        field: "maxStockLevel",
        type: "suggestion",
        message: `💡 Receive headroom (${receiveZone} units) is smaller than operating range (${operateZone} units). Consider raising max level.`,
      });
    }
  }

  // Rule 9 — minLevel ≥ safetyStock × 1.5
  if (minLevel > 0 && safetyStock > 0 && minLevel < safetyStock * 1.5) {
    messages.push({
      field: "minStockLevel",
      type: "suggestion",
      message: `💡 Consider setting min level to ${Math.ceil(safetyStock * 1.5)} (1.5× safety stock) for better reaction time.`,
    });
  }

  // Rule 10 — Lead-time coherence
  if (leadTimeDays > 0 && avgDailySales > 0) {
    const minReorderPoint = safetyStock + avgDailySales * leadTimeDays;
    if (reorderPoint > 0 && reorderPoint < minReorderPoint) {
      messages.push({
        field: "reorderPoint",
        type: "suggestion",
        message: `💡 Based on sales, reorder point could be ${Math.ceil(minReorderPoint)} (safety ${safetyStock} + ${avgDailySales}/day × ${leadTimeDays} days).`,
      });
    }
  }

  return messages;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getFieldMessages(field: string, messages: InfoMessage[]) {
  return messages.filter((m) => m.field === field);
}

function inputBorderInfo(field: string, messages: InfoMessage[], defaultCls: string) {
  const fieldMessages = getFieldMessages(field, messages);
  if (fieldMessages.length > 0) {
    return "border-2 border-emerald-400 focus:border-emerald-500 bg-emerald-50/30";
  }
  return defaultCls;
}

// ─── FieldInfo component (Green themed info messages) ──────────────────────────
function FieldInfo({
  field,
  messages,
  hint,
}: {
  field: string;
  messages: InfoMessage[];
  hint?: string;
}) {
  const fieldMessages = getFieldMessages(field, messages);
  
  return (
    <div className="mt-1.5 space-y-1">
      {hint && !fieldMessages.length && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {fieldMessages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-1.5 text-xs p-2 rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-800"
        >
          {m.type === "suggestion" ? (
            <Lightbulb className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          ) : (
            <Info className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          )}
          <span>{m.message}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── 3-Zone Stock Visualiser (Informational only) ─────────────────────────────
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
          <Info className="h-3.5 w-3.5 text-emerald-600" />
          3-Zone Stock Model (Informational)
          <span className="font-normal text-gray-400">(SAP / Oracle WMS)</span>
        </p>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${zone.bg} ${zone.color}`}
        >
          {zone.label}
        </span>
      </div>

      <div className="relative h-6 w-full rounded-full overflow-hidden bg-gray-100">
        <div
          className="absolute top-0 left-0 h-full bg-red-300/60"
          style={{ width: `${safetyPct}%` }}
        />
        <div
          className="absolute top-0 h-full bg-emerald-300/60"
          style={{ left: `${safetyPct}%`, width: `${reorderPct - safetyPct}%` }}
        />
        <div
          className="absolute top-0 h-full bg-amber-300/60"
          style={{ left: `${reorderPct}%`, width: `${100 - reorderPct}%` }}
        />
        <motion.div
          className="absolute top-0 h-full w-1 bg-blue-600 shadow-lg"
          style={{ left: `${currentPct}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 flex items-center justify-around px-1">
          <span className="text-[9px] font-bold text-red-700 z-10">🔴 Danger</span>
          <span className="text-[9px] font-bold text-emerald-700 z-10">🟢 Operating</span>
          <span className="text-[9px] font-bold text-amber-700 z-10">🟡 Excess</span>
        </div>
      </div>

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

      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-bold text-red-700 mb-0.5">🔴 Danger Zone</p>
          <p className="text-red-600">0 → {safetyStock || "Safety"}</p>
          <p className="text-gray-500 mt-0.5">Emergency - consider reorder</p>
        </div>
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="font-bold text-emerald-700 mb-0.5">🟢 Operating Zone</p>
          <p className="text-emerald-600">{safetyStock || "Safety"} → {reorderPoint || "Reorder"}</p>
          <p className="text-gray-500 mt-0.5">Normal operations</p>
        </div>
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="font-bold text-amber-700 mb-0.5">🟡 Excess Zone</p>
          <p className="text-amber-600">{reorderPoint || "Reorder"} → {maxLevel}</p>
          <p className="text-gray-500 mt-0.5">Consider reducing stock</p>
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
  isInfoOnly = true,
}: InventorySectionProps) {
  // Parse all values
  const stockQty = Math.max(0, parseInt(currentVariant.stockQuantity || "0") || 0);
  const safetyStock = Math.max(0, parseInt(currentVariant.safetyStock || "0") || 0);
  const minLevel = Math.max(0, parseInt(currentVariant.minStockLevel || "0") || 0);
  const reorderPoint = Math.max(0, parseInt(currentVariant.reorderPoint || "0") || 0);
  const maxLevel = Math.max(0, parseInt(currentVariant.maxStockLevel || "0") || 0);
  const leadTimeDays = Math.max(0, parseInt(currentVariant.leadTimeDays || "0") || 0);
  const avgDailySales = Math.max(0, parseFloat(currentVariant.avgDailySales || "0") || 0);

  // Get info messages
  const infoMessages = useMemo(
    () =>
      getInventoryInfoMessages(
        stockQty,
        safetyStock,
        minLevel,
        reorderPoint,
        maxLevel,
        leadTimeDays,
        avgDailySales,
      ),
    [stockQty, safetyStock, minLevel, reorderPoint, maxLevel, leadTimeDays, avgDailySales],
  );

  // Supplier lazy load
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierInput, setSupplierInput] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(() => {
    if (currentVariant.supplierId) {
      return { _id: currentVariant.supplierId };
    }
    return null;
  });

  const { data: templates } = useFormActions<any>("/suppliers", "suppliers", "Suppliers");

  const handleSupplierFirstOpen = useCallback(() => {
    if (!Array.isArray(templates)) return;
    if (suppliers.length > 0) return;

    try {
      setSuppliersLoading(true);
      const formattedSuppliers: Supplier[] = templates.map((s: any) => ({
        _id: s._id,
        supplierName: s?.contactInformation?.primaryContactName || "Unnamed Supplier",
        contactEmail: s?.contactInformation?.emailAddress || "",
        phone: s?.contactInformation?.phoneNumber || "",
        code: s?.contactInformation?.businessRegNumber || "",
      }));
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

  // Stock status (informational only)
  const isLowStock = minLevel > 0 && stockQty < minLevel;
  const isCritical = reorderPoint > 0 && stockQty <= reorderPoint;
  const isOverstocked = maxLevel > 0 && stockQty > maxLevel;
  const isOptimal = minLevel > 0 && maxLevel > 0 && stockQty >= minLevel && stockQty <= maxLevel;

  const getStockStatus = () => {
    if (stockQty === 0) return { label: "Out of Stock", color: "from-red-500 to-rose-600", icon: AlertTriangle };
    if (isCritical) return { label: "Critical", color: "from-red-500 to-orange-600", icon: AlertTriangle };
    if (isLowStock) return { label: "Low Stock", color: "from-orange-500 to-amber-600", icon: TrendingDown };
    if (isOverstocked) return { label: "Overstocked", color: "from-purple-500 to-pink-600", icon: TrendingUp };
    if (isOptimal) return { label: "Optimal", color: "from-green-500 to-emerald-600", icon: PackageCheck };
    return { label: "Normal", color: "from-blue-500 to-cyan-600", icon: Package };
  };

  const getStatusDotColor = (label: string) => {
    const t = label.toLowerCase();
    if (t.includes("in stock") || t.includes("available")) return "bg-green-500";
    if (t.includes("out of stock")) return "bg-red-500";
    if (t.includes("low stock")) return "bg-yellow-500";
    if (t.includes("reserved")) return "bg-blue-500";
    return "bg-purple-500";
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const stockUtilization = maxLevel > 0 ? Math.min((stockQty / maxLevel) * 100, 100) : 0;
  const suggestedReorderPoint = leadTimeDays > 0 && avgDailySales > 0
    ? Math.ceil(safetyStock + avgDailySales * leadTimeDays)
    : null;

  return (
    <div className="space-y-4">
      {/* Info Banner - Green themed */}
      {infoMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold text-emerald-800">
              Inventory Suggestions ({infoMessages.length})
            </p>
          </div>
          <div className="space-y-1">
            {infoMessages.map((m, i) => (
              <p key={i} className="text-xs pl-6 text-emerald-700">
                • {m.message}
              </p>
            ))}
          </div>
          <p className="text-xs text-emerald-600 mt-2 pt-1 border-t border-emerald-200">
            ℹ️ These are informational suggestions only. You can add the product without changes.
          </p>
        </motion.div>
      )}

      {/* Stock Quantity */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Stock Quantity
        </label>
        <Input
          type="number"
          min="0"
          value={currentVariant.stockQuantity}
          onChange={(e) => onVariantFieldChange("stockQuantity", e.target.value)}
          placeholder="0"
          className={inputBorderInfo("stockQuantity", infoMessages, "border-2 border-gray-200 focus:border-emerald-500")}
        />
        <FieldInfo field="stockQuantity" messages={infoMessages} hint="Current on-hand stock (physical count)" />

        {stockQty > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">{stockStatus.label}</span>
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
                <span className="text-xs text-gray-500">{stockUtilization.toFixed(0)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Safety Stock */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Safety Stock
        </label>
        <Input
          type="number"
          min="0"
          value={currentVariant.safetyStock || ""}
          onChange={(e) => onVariantFieldChange("safetyStock", e.target.value)}
          placeholder="Buffer for demand spikes"
          className={inputBorderInfo("safetyStock", infoMessages, "border-2 border-gray-200 focus:border-emerald-500")}
        />
        <FieldInfo field="safetyStock" messages={infoMessages} hint="Emergency buffer before stockout" />
      </div>

      {/* Min / Max / Reorder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Stock Level</label>
          <Input
            type="number"
            min="0"
            value={currentVariant.minStockLevel}
            onChange={(e) => onVariantFieldChange("minStockLevel", e.target.value)}
            placeholder="0"
            className={inputBorderInfo("minStockLevel", infoMessages, "border-2 border-gray-200 focus:border-emerald-500")}
          />
          <FieldInfo field="minStockLevel" messages={infoMessages} hint="Alert when stock hits this level" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reorder Point</label>
          <Input
            type="number"
            min="0"
            value={currentVariant.reorderPoint}
            onChange={(e) => onVariantFieldChange("reorderPoint", e.target.value)}
            placeholder="0"
            className={inputBorderInfo("reorderPoint", infoMessages, "border-2 border-gray-200 focus:border-emerald-500")}
          />
          <FieldInfo
            field="reorderPoint"
            messages={infoMessages}
            hint={suggestedReorderPoint ? `Suggested: ${suggestedReorderPoint}` : "Place purchase order when stock hits this level"}
          />
          {suggestedReorderPoint && reorderPoint !== suggestedReorderPoint && (
            <button
              type="button"
              onClick={() => onVariantFieldChange("reorderPoint", String(suggestedReorderPoint))}
              className="mt-1 text-xs text-emerald-600 hover:text-emerald-800 underline"
            >
              Apply suggested: {suggestedReorderPoint}
            </button>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Maximum Stock Level</label>
          <Input
            type="number"
            min="0"
            value={currentVariant.maxStockLevel}
            onChange={(e) => onVariantFieldChange("maxStockLevel", e.target.value)}
            placeholder="0"
            className={inputBorderInfo("maxStockLevel", infoMessages, "border-2 border-gray-200 focus:border-emerald-500")}
          />
          <FieldInfo field="maxStockLevel" messages={infoMessages} hint="Bin/location physical capacity" />
        </div>
      </div>

      {/* 3-Zone Visualiser */}
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

      {/* Supplier */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
          <Truck className="h-4 w-4 text-emerald-600" />
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
          colorTheme="emerald"
        />
        {selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium">{selectedSupplier.supplierName}</span>
            {selectedSupplier.contactEmail && (
              <span className="text-gray-400">· {selectedSupplier.contactEmail}</span>
            )}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stock Location (Aisle/Shelf)</label>
          <Input
            value={currentVariant.stockLocation}
            onChange={(e) => onVariantFieldChange("stockLocation", e.target.value)}
            placeholder="e.g., Aisle 3, Shelf B"
            className="border-2 border-gray-200 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Lead Time (Days)</label>
          <Input
            type="number"
            min="0"
            value={currentVariant.leadTimeDays || ""}
            onChange={(e) => onVariantFieldChange("leadTimeDays", e.target.value)}
            placeholder="e.g., 7"
            className="border-2 border-gray-200 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Warehouse & Bin Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-emerald-600" />
            Warehouse
          </label>
          <Select value={currentVariant.warehouseId} onValueChange={(v) => onVariantFieldChange("warehouseId", v)}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-emerald-500">
              <SelectValue placeholder="Select warehouse..." />
            </SelectTrigger>
            <SelectContent>
              {warehouses.length > 0 ? (
                warehouses.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))
              ) : (
                <SelectItem value="no-warehouses" disabled>No warehouses configured</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bin Location</label>
          <Input
            value={currentVariant.binLocation}
            onChange={(e) => onVariantFieldChange("binLocation", e.target.value)}
            placeholder="e.g., A-12-03"
            className="border-2 border-gray-200 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Product Status / Condition / Warehouse Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-emerald-600" /> Product Status
          </label>
          <Select value={currentVariant.productStatusId} onValueChange={(v) => onVariantFieldChange("productStatusId", v)}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-emerald-500">
              <SelectValue placeholder="Select product status..." />
            </SelectTrigger>
            <SelectContent>
              {productStatus.length > 0 ? (
                productStatus.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))
              ) : (
                <SelectItem value="no-product-status" disabled>No product status configured</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" /> Item Condition
          </label>
          <Select value={currentVariant.conditionId} onValueChange={(v) => onVariantFieldChange("conditionId", v)}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-emerald-500">
              <SelectValue placeholder="Select condition..." />
            </SelectTrigger>
            <SelectContent>
              {conditions.length > 0 ? (
                conditions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))
              ) : (
                <SelectItem value="no-conditions" disabled>No conditions configured</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-emerald-600" /> Warehouse Status
          </label>
          <Select value={currentVariant.warehouseStatusId || ""} onValueChange={(v) => onVariantFieldChange("warehouseStatusId", v)}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-emerald-500">
              <SelectValue placeholder="Select warehouse status..." />
            </SelectTrigger>
            <SelectContent>
              {warehouseStatus.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getStatusDotColor(s.label)}`} />
                    {s.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
        <input
          type="checkbox"
          checked={currentVariant.featured || false}
          onChange={(e) => onVariantFieldChange("featured", e.target.checked)}
          className="h-5 w-5 rounded border-2 border-emerald-300 text-emerald-600 focus:ring-2 focus:ring-emerald-200"
        />
        <div>
          <label className="text-sm font-medium text-gray-700 cursor-pointer block">Featured Product</label>
          <p className="text-xs text-gray-500 mt-1">Display prominently on storefront and promotions</p>
        </div>
      </div>

      {/* Stock Status Dashboard */}
      {stockQty > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <StockIcon className="h-5 w-5" />
              Stock Status Dashboard
            </h3>
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${stockStatus.color} text-white text-xs font-bold`}>
              {stockStatus.label}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Safety Stock", value: safetyStock || "—", border: "border-teal-200", text: "text-teal-700" },
              { label: "Min Level", value: minLevel || "—", border: "border-red-200", text: "text-red-700" },
              { label: "Current", value: stockQty, border: "border-blue-200", text: "text-blue-900 font-extrabold" },
              { label: "Reorder At", value: reorderPoint || "—", border: "border-amber-200", text: "text-amber-700" },
              { label: "Max Level", value: maxLevel || "—", border: "border-green-200", text: "text-green-700" },
            ].map((item) => (
              <div key={item.label} className={`bg-white/50 backdrop-blur-sm p-3 rounded-lg border ${item.border}`}>
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

// function getStatusDotColor(label: string) {
//   const t = label.toLowerCase();
//   if (t.includes("in stock") || t.includes("available")) return "bg-green-500";
//   if (t.includes("out of stock")) return "bg-red-500";
//   if (t.includes("low stock")) return "bg-yellow-500";
//   if (t.includes("reserved")) return "bg-blue-500";
//   return "bg-purple-500";
// }