// src/services/reorder.service.ts
// ─────────────────────────────────────────────────────────────────────────────
// FIXES IN THIS VERSION:
//
//  BUG 1 (CRITICAL — "0 products" in proposals):
//    OLD:  ProductModal.find({ isActive: true })
//    NEW:  ProductModal.find({ isActive: { $ne: false } })
//
//    MongoDB's { isActive: true } ONLY matches documents where the field
//    exists AND equals true. If a product was saved without isActive set
//    (undefined), it does NOT match — the scan finds 0 products silently.
//    { $ne: false } correctly means "include everything except explicitly disabled".
//
//  BUG 2 (Stock not updated on PO received):
//    That fix lives in purchaseOrderCustom.controller.ts → updateStatus().
//    See that file for the $inc + arrayFilters implementation.
//
//  ADDED: console.log at each scan step so you can see exactly what's
//    happening in your server logs without needing a debugger.
// ─────────────────────────────────────────────────────────────────────────────

import { Types } from "mongoose";
import { ProductModal }    from "../models/product.models";
import { PurchaseOrder }   from "../models/purchaseOrder.model";
import { SupplierModel }   from "../models/suppliers/supplier.models";
import { User }            from "../models/user.models";
import { StockAlertModel } from "../models/StockAlert.models";  
import { createOrUpdateAlert }  from "./stockAlert.service";
import { emailService }         from "./email.service";
import { ReorderAlertData }     from "../types/email/email.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReorderSuggestion {
  productId:          string;
  productName:        string;
  sku:                string;
  category?:          string;
  currentStock:       number;
  reorderPoint:       number;
  safetyStock:        number;
  maxStockLevel:      number;
  suggestedOrderQty:  number;
  unitPrice:          number;
  supplierId:         string;
  supplierName:       string;
  supplierEmail:      string;
  leadTimeDays:       number;
  averageDailySales?: number;
  daysUntilStockout?: number;
  severity:           "critical" | "warning" | "low";
  lastOrdered?:       Date;
  alertId?:           string;
}

export interface ReorderScanResult {
  scannedProducts:  number;
  suggestionsFound: number;
  newAlertsCreated: number;
  escalatedAlerts:  number;
  emailsSent:       number;
  suggestions:      ReorderSuggestion[];
}

// ── Severity calculator ───────────────────────────────────────────────────────

function calculateSeverity(
  currentStock: number,
  safetyStock:  number,
  reorderPoint: number
): "critical" | "warning" | "low" {
  if (currentStock === 0)                                return "critical";
  if (safetyStock > 0 && currentStock <= safetyStock)   return "critical";
  if (reorderPoint > 0 && currentStock <= reorderPoint) return "warning";
  return "low";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export async function getReorderSuggestions(
  userId:       string,
  sendEmails:   boolean = true,
  createAlerts: boolean = true
): Promise<ReorderScanResult> {


  const suggestions:  ReorderSuggestion[] = [];
  let newAlertsCreated = 0;
  let escalatedAlerts  = 0;
  let emailsSent       = 0;

  // ── A: Owner email (only needed when sending emails) ──────────────────────
  let ownerEmail = "";
  if (sendEmails) {
    const owner = await User.findById(userId).select("email").lean();
    ownerEmail  = (owner as any)?.email ?? "";
    if (!ownerEmail) console.warn(`[ReorderScan] ⚠️  No email for userId=${userId}`);
  }

  // ── B: Load products ──────────────────────────────────────────────────────
  // ✅ FIX: was { isActive: true } — excluded products where isActive is
  //    undefined (not explicitly set). Changed to $ne: false so we include
  //    all products except those explicitly disabled.
  const products = await ProductModal.find({
    userId:    new Types.ObjectId(userId),
    isDeleted: false,
    isActive:  { $ne: false },   // ← FIXED (was: isActive: true)
  })
    .select("_id productName sku attributes category")
    .lean();



  // ── If still 0, log a diagnostic hint ────────────────────────────────────
  if (products.length === 0) {
    // Check whether ANY products exist for this userId (even deleted/inactive)
    const anyCount = await ProductModal.countDocuments({ userId: new Types.ObjectId(userId) });
    const deletedCount = await ProductModal.countDocuments({ userId: new Types.ObjectId(userId), isDeleted: true });
   
    return { scannedProducts: 0, suggestionsFound: 0, newAlertsCreated: 0, escalatedAlerts: 0, emailsSent: 0, suggestions: [] };
  }

  // ── C: Active POs — load once, build SKU set for O(1) lookup ─────────────
  const activePOs = await PurchaseOrder.find({
    userId:    userId,
    status:    { $in: ["pending", "approved", "ordered"] },
    isDeleted: false,
  }).select("items orderNumber status").lean();

  const skusWithActivePO = new Set<string>();
  // Also track which PO number is blocking each SKU — useful for diagnostics
  const skuToPONumber = new Map<string, string>();
  for (const po of activePOs) {
    for (const item of ((po as any).items ?? [])) {
      if (item.sku) {
        skusWithActivePO.add(item.sku);
        skuToPONumber.set(item.sku, `${(po as any).orderNumber} [${(po as any).status}]`);
      }
    }
  }
  // console.log(`[ReorderScan] Active PO count: ${activePOs.length} | SKUs on order: ${skusWithActivePO.size}`);
  // if (skusWithActivePO.size > 0) {
  //   console.log(`[ReorderScan] Blocked SKUs:`, [...skuToPONumber.entries()].map(([sku, po]) => `"${sku}" → ${po}`).join(", "));
  // }

  // ── D: Suppliers — load once ───────────────────────────────────────────────
  const allSupplierIds = (products as any[]).flatMap((p: any) =>
    (p.attributes ?? [])
      .map((a: any) => {
        const raw = a.stock?.supplierId;
        return (raw as any)?.$oid ?? String(raw ?? "");
      })
      .filter(Boolean)
  );

  const suppliers = await SupplierModel.find({
    _id:       { $in: [...new Set(allSupplierIds)] },
    isDeleted: false,
  }).select("_id supplierIdentification contactInformation operationalInformation").lean();

  const supplierMap = new Map<string, { name: string; email: string }>(
    (suppliers as any[]).map((s: any) => [
      String(s._id),
      {
        name:  s.supplierIdentification?.legalBusinessName
            || s.supplierIdentification?.tradingName
            || s.contactInformation?.primaryContactName
            || "Unknown Supplier",
        email: s.contactInformation?.emailAddress
            || s.operationalInformation?.orderContactEmail
            || "",
      },
    ])
  );

  // ── E: Existing pending alert SKUs (avoid duplicate emails) ───────────────
  const existingPending = await StockAlertModel
    .find({ userId, status: "pending" })
    .select("sku").lean();
  const skusAlreadyAlerted = new Set((existingPending as any[]).map((a: any) => a.sku));

  // ── F: Scan products ───────────────────────────────────────────────────────
  let skippedNoReorderPoint = 0;
  let skippedAboveReorder   = 0;
  let skippedActivePO       = 0;
  let skippedZeroQty        = 0;

  for (const product of products as any[]) {
    for (const attr of (product.attributes ?? [])) {
      const stock = attr.stock;
      if (!stock) continue;

      const currentStock:  number = stock.stockQuantity ?? 0;
      const reorderPoint:  number = stock.reorderPoint  ?? 0;
      const safetyStock:   number = stock.safetyStock   ?? 0;
      const maxStockLevel: number = stock.maxStockLevel ?? 0;
      const leadTimeDays:  number = stock.leadTimeDays  ?? 0;
      const avgDailySales: number = stock.avgDailySales ?? 0;
      const sku = attr.sku ?? product.sku;

      // Skip if reorder point not configured
      if (reorderPoint <= 0) { skippedNoReorderPoint++; continue; }

      // Skip if stock is above reorder point — not yet triggered
      if (currentStock > reorderPoint) { skippedAboveReorder++; continue; }

      // Skip if a PO is already pending/ordered for this SKU
      if (skusWithActivePO.has(sku)) {
        // console.log(`[ReorderScan] ⏸  Skipped "${product.productName}" (sku=${sku}) — active PO already exists: ${skuToPONumber.get(sku)}`);
        // console.log(`[ReorderScan]    → Mark that PO as "received" to allow reordering again`);
        skippedActivePO++;
        continue;
      }

      // ── Suggested order quantity ───────────────────────────────────────────
      // Normal formula: order up to maxStockLevel (fill the tank)
      //   suggestedQty = maxStockLevel - currentStock
      //
      // BAD DATA FALLBACK: if maxStockLevel was set lower than currentStock
      // (e.g. maxStockLevel=4 but currentStock=9 — impossible in reality),
      // we use a safe fallback instead of returning 0 and silently hiding the product.
      //
      // Fallback formula: order enough to reach 2× reorderPoint
      //   This gives a reasonable buffer without needing correct maxStockLevel data.
      //   Example: reorderPoint=20, currentStock=9 → order 20*2 - 9 = 31 units
      //
      let suggestedOrderQty: number;
      if (maxStockLevel > currentStock) {
        // Normal case — max is properly set above current
        suggestedOrderQty = maxStockLevel - currentStock;
      } else if (maxStockLevel > 0 && maxStockLevel <= currentStock) {
        // Bad data: maxStockLevel is set but lower than current stock
        // Log a warning so the user knows to fix their product data
        // console.warn(`[ReorderScan] ⚠️  Bad data for "${product.productName}" (sku=${sku}): maxStockLevel=${maxStockLevel} < currentStock=${currentStock}`);
        // console.warn(`[ReorderScan]    → Update this product's maxStockLevel in the product editor`);
        // console.warn(`[ReorderScan]    → Using fallback formula: reorderPoint×2 - currentStock`);
        suggestedOrderQty = Math.max(1, reorderPoint * 2 - currentStock);
      } else {
        // maxStockLevel is 0 — not configured at all
        // Same fallback: 2× reorderPoint
        suggestedOrderQty = Math.max(1, reorderPoint * 2 - currentStock);
        if (suggestedOrderQty <= 0) { skippedZeroQty++; continue; }
      }

      const severity          = calculateSeverity(currentStock, safetyStock, reorderPoint);
      const daysUntilStockout = avgDailySales > 0
        ? Math.floor(currentStock / avgDailySales)
        : undefined;

      const rawSupplierId = (stock.supplierId as any)?.$oid ?? String(stock.supplierId ?? "");
      const supplierInfo  = supplierMap.get(rawSupplierId) ?? { name: "No supplier linked", email: "" };

      // console.log(`[ReorderScan] ✅ NEEDS REORDER: "${product.productName}" sku=${sku} stock=${currentStock} reorderAt=${reorderPoint} severity=${severity}`);

      const suggestion: ReorderSuggestion = {
        productId:         String(product._id),
        productName:       product.productName,
        sku,
        category:          product.category?.name,
        currentStock,
        reorderPoint,
        safetyStock,
        maxStockLevel,
        suggestedOrderQty,
        unitPrice:         attr.pricing?.[0]?.costPrice ?? 0,
        supplierId:        rawSupplierId,
        supplierName:      supplierInfo.name,
        supplierEmail:     supplierInfo.email,
        leadTimeDays,
        averageDailySales: avgDailySales || undefined,
        daysUntilStockout,
        severity,
      };

      // ── G: Save StockAlert ───────────────────────────────────────────────
      if (createAlerts) {
        try {
          const { isNew, escalated, alert } = await createOrUpdateAlert({
            userId, productId: String(product._id), productName: product.productName,
            sku, category: product.category?.name,
            currentStock, reorderPoint, safetyStock, maxStockLevel, suggestedOrderQty,
            averageDailySales: avgDailySales || undefined, daysUntilStockout,
            supplierId: rawSupplierId || undefined,
            supplierName: supplierInfo.name, supplierEmail: supplierInfo.email,
            severity,
          });

          if (alert)     suggestion.alertId = String(alert._id);
          if (isNew)     newAlertsCreated++;
          if (escalated) escalatedAlerts++;

          // ── H: Send owner email ─────────────────────────────────────────
          const shouldEmail =
            sendEmails && ownerEmail && (isNew || escalated) && !skusAlreadyAlerted.has(sku);

          if (shouldEmail) {
            try {
              const alertEmailData: ReorderAlertData = {
                productId: String(product._id), productName: product.productName, sku,
                currentStock, reorderPoint, safetyStock, maxStockLevel, suggestedOrderQty,
                daysUntilStockout, supplierId: rawSupplierId || undefined,
                supplierName: supplierInfo.name, supplierEmail: supplierInfo.email,
                category: product.category?.name, severity,
                averageDailySales: avgDailySales || undefined,
              };
              await emailService.sendReorderAlertToUser(alertEmailData, ownerEmail, {
                cc: process.env.REORDER_ALERT_CC_EMAIL,
              });
              emailsSent++;
              skusAlreadyAlerted.add(sku);
            } catch (emailErr) {
              console.error(`[ReorderScan] Email failed for SKU ${sku}:`, emailErr);
            }
          }
        } catch (alertErr) {
          console.error(`[ReorderScan] Alert DB error for SKU ${sku}:`, alertErr);
        }
      }

      suggestions.push(suggestion);
    }
  }

  // ── Summary log ───────────────────────────────────────────────────────────
  // console.log(`[ReorderScan] ─── Scan complete ───`);
  // console.log(`[ReorderScan] Scanned: ${products.length} products`);
  // console.log(`[ReorderScan] Suggestions: ${suggestions.length}`);
  // console.log(`[ReorderScan] Skipped — no reorderPoint set: ${skippedNoReorderPoint}`);
  // console.log(`[ReorderScan] Skipped — stock above reorder: ${skippedAboveReorder}`);
  // console.log(`[ReorderScan] Skipped — active PO exists:    ${skippedActivePO}`);
  // console.log(`[ReorderScan] Skipped — qty would be 0:      ${skippedZeroQty}`);

  // Sort: critical first, then by days until stockout
  const sevOrder: Record<string, number> = { critical: 0, warning: 1, low: 2 };
  suggestions.sort((a, b) => {
    const d = sevOrder[a.severity] - sevOrder[b.severity];
    return d !== 0 ? d : (a.daysUntilStockout ?? 9999) - (b.daysUntilStockout ?? 9999);
  });

  return {
    scannedProducts:  products.length,
    suggestionsFound: suggestions.length,
    newAlertsCreated,
    escalatedAlerts,
    emailsSent,
    suggestions,
  };
}