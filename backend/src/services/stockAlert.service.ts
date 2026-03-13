// ─────────────────────────────────────────────────────────────────────────────
// src/services/stockAlert.service.ts
//
// STEP 3 OF 6
//
// This is the SERVICE — all the database operations for StockAlerts.
// It USES the model from Step 2.
// It does NOT send emails — that happens in Step 4 (reorder.service.ts).
//
// Functions exported:
//   createOrUpdateAlert    → upsert an alert (returns isNew + escalated flags)
//   markAlertAsOrdered     → called when PO is created for that product
//   resolveAlert           → called when stock goes back above reorder point
//   resolveAlertsForSkus   → called when a PO is received (bulk resolve)
//   dismissAlert           → user clicks X on bell notification
//   getPendingAlerts       → full list for bell dropdown panel
//   getPendingAlertCount   → count only for badge number (runs every 60s)
// ─────────────────────────────────────────────────────────────────────────────

import { Types } from "mongoose";
import { StockAlertModel } from "../models/StockAlert.models"
import { IStockAlert } from "../../../common/IStockAlert.interface";


// ── Input type for creating an alert ─────────────────────────────────────────

export interface CreateAlertPayload {
    userId: string;
    productId: string;
    productName: string;
    sku: string;
    category?: string;
    currentStock: number;
    reorderPoint: number;
    safetyStock: number;
    maxStockLevel: number;
    suggestedOrderQty: number;
    averageDailySales?: number;
    daysUntilStockout?: number;
    supplierId?: string;
    supplierName: string;
    supplierEmail: string;
    severity: "critical" | "warning" | "low";
    lastOrdered?: Date;
}

// ── Return type — tells the caller what happened ──────────────────────────────

export interface AlertCheckResult {
    alert: IStockAlert | null;
    isNew: boolean;     // true  → brand new alert, caller should send email
    escalated: boolean;     // true  → severity jumped to critical, re-send email
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE OR UPDATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * If a PENDING alert already exists for this SKU + user:
 *   → Updates the stock numbers and severity
 *   → Returns isNew = false
 *   → Returns escalated = true if severity jumped to critical
 *
 * If NO pending alert exists:
 *   → Creates a new one
 *   → Returns isNew = true  (caller should send email)
 */
export async function createOrUpdateAlert(
    payload: CreateAlertPayload
): Promise<AlertCheckResult> {

    // Check for existing pending alert for this exact SKU
    const existing = await StockAlertModel.findOne({
        userId: payload.userId,
        sku: payload.sku,
        status: "pending",
    });

    if (existing) {
        const prevSeverity = existing.severity;

        // Update with latest stock numbers
        existing.currentStock = payload.currentStock;
        existing.severity = payload.severity;
        existing.suggestedOrderQty = payload.suggestedOrderQty;
        existing.daysUntilStockout = payload.daysUntilStockout;
        existing.averageDailySales = payload.averageDailySales;
        await existing.save();

        // Escalated = was warning/low, now critical
        const escalated = prevSeverity !== "critical" && payload.severity === "critical";
        return { alert: existing, isNew: false, escalated };
    }

    // No existing alert → create new one
    const alert = await StockAlertModel.create({
        userId: payload.userId,
        productId: new Types.ObjectId(payload.productId),
        productName: payload.productName,
        sku: payload.sku,
        category: payload.category,

        currentStock: payload.currentStock,
        reorderPoint: payload.reorderPoint,
        safetyStock: payload.safetyStock,
        maxStockLevel: payload.maxStockLevel,
        suggestedOrderQty: payload.suggestedOrderQty,
        averageDailySales: payload.averageDailySales,
        daysUntilStockout: payload.daysUntilStockout,

        supplierId: payload.supplierId ? new Types.ObjectId(payload.supplierId) : undefined,
        supplierName: payload.supplierName,
        supplierEmail: payload.supplierEmail,

        severity: payload.severity,
        status: "pending",
        lastOrdered: payload.lastOrdered,
        emailSentAt: new Date(),
    });

    return { alert, isNew: true, escalated: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS UPDATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called when a PO is created for this product.
 * Changes status: pending → ordered
 */
export async function markAlertAsOrdered(
    productId: string,
    userId: string,
    poId: string
): Promise<void> {
    await StockAlertModel.updateMany(
        {
            productId: new Types.ObjectId(productId),
            userId,
            status: "pending",
        },
        {
            $set: {
                status: "ordered",
                poId: new Types.ObjectId(poId),
            },
        }
    );
}

/**
 * Called when stock is replenished above reorder point.
 * Changes status: pending/ordered → resolved
 */
export async function resolveAlert(productId: string, userId: string): Promise<void> {
    await StockAlertModel.updateMany(
        {
            productId: new Types.ObjectId(productId),
            userId,
            status: { $in: ["pending", "ordered"] },
        },
        {
            $set: {
                status: "resolved",
                resolvedAt: new Date(),
            },
        }
    );
}

/**
 * Called when a PO status changes to "received".
 * Resolves all alerts for all SKUs in that PO at once.
 */
export async function resolveAlertsForSkus(
    skus: string[],
    userId: string
): Promise<void> {
    if (!skus.length) return;
    await StockAlertModel.updateMany(
        {
            sku: { $in: skus },
            userId,
            status: { $in: ["pending", "ordered"] },
        },
        {
            $set: {
                status: "resolved",
                resolvedAt: new Date(),
            },
        }
    );
}

/**
 * User clicks X on the bell notification.
 * Soft-dismiss: pending → ordered (keeps the record, just hides from bell).
 */
export async function dismissAlert(alertId: string): Promise<void> {
    await StockAlertModel.findByIdAndUpdate(alertId, {
        $set: { status: "ordered" },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// READ OPERATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns full list of pending alerts for the bell dropdown.
 * Sorted: critical first, then warning, then low.
 */
export async function getPendingAlerts(userId: string): Promise<IStockAlert[]> {
    const alerts = await StockAlertModel
        .find({ userId, status: "pending" })
        .sort({ createdAt: -1 })
        .lean() as IStockAlert[];

    const order: Record<string, number> = { critical: 0, warning: 1, low: 2 };
    return alerts.sort((a, b) => order[a.severity] - order[b.severity]);
}

/**
 * Returns only the COUNT of pending alerts.
 * This is the fast, lightweight endpoint polled every 60 seconds
 * by the bell badge in the frontend.
 */
export async function getPendingAlertCount(userId: string): Promise<number> {
    return StockAlertModel.countDocuments({ userId, status: "pending" });
}