// ─────────────────────────────────────────────────────────────────────────────
// common/utils/stock-status.util.ts
// Pure utility — no mongoose, no DB, no side-effects.
// Import this anywhere: backend hooks, GRN service, frontend badges, etc.
// ─────────────────────────────────────────────────────────────────────────────

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface StockLevels {
  stockQuantity:  number;
  reorderPoint?:  number;   // qty <= this   → low-stock
  minStockLevel?: number;   // informational
  maxStockLevel?: number;   // used for reorderQuantity calc
  safetyStock?:   number;   // informational
}

export interface StockStatusResult {
  status:          StockStatus;
  label:           string;   // "In Stock" | "Low Stock" | "Out of Stock"
  color:           string;   // "green" | "amber" | "red"  (for frontend badge)
  reorderNeeded:   boolean;
  reorderQuantity: number;   // units to order to reach maxStockLevel
}

/**
 * computeStockStatus — single source of truth.
 *
 * Priority order:
 *   1. qty === 0                         → out-of-stock
 *   2. qty > 0 AND qty <= reorderPoint   → low-stock
 *   3. qty > reorderPoint                → in-stock
 */
export function computeStockStatus(levels: StockLevels): StockStatusResult {
  const qty      = Math.max(0, Number(levels.stockQuantity) || 0);
  const reorder  = Math.max(0, Number(levels.reorderPoint)  || 0);
  const maxLevel = Math.max(0, Number(levels.maxStockLevel) || 0);

  let status: StockStatus;
  if (qty === 0) {
    status = "out-of-stock";
  } else if (reorder > 0 && qty <= reorder) {
    status = "low-stock";
  } else {
    status = "in-stock";
  }

  const reorderNeeded   = status !== "in-stock";
  const reorderQuantity = reorderNeeded && maxLevel > qty ? maxLevel - qty : 0;

  const META: Record<StockStatus, { label: string; color: string }> = {
    "in-stock":     { label: "In Stock",     color: "green" },
    "low-stock":    { label: "Low Stock",    color: "amber" },
    "out-of-stock": { label: "Out of Stock", color: "red"   },
  };

  return { status, reorderNeeded, reorderQuantity, ...META[status] };
}

/** Shorthand — returns only the status string for DB writes. */
export function getStockStatus(
  stockQuantity: number,
  reorderPoint: number = 0
): StockStatus {
  return computeStockStatus({ stockQuantity, reorderPoint }).status;
}

/** Mutates a stock sub-document object in-place — works on plain objects too. */
export function syncStockStatusOnDoc(stock: Record<string, any>): void {
  if (!stock) return;
  stock.stockStatus = getStockStatus(stock.stockQuantity, stock.reorderPoint);
}