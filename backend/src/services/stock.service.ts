// // // // services/stock.service.ts
// // // import { ProductModal } from "../models/product.models";
// // // import { PurchaseOrder } from "../models/purchaseOrder.model";
// // // import { GrnModel } from "../models/grn.models";
// // // import { GoodsReturn }  from "../models/goodsReturn.model";
// // // import { emailService } from "./email.service";

// // // interface StockDelta {
// // //   productId: string;
// // //   sku:       string;
// // //   delta:     number;
// // //   reason:    string;
// // // }

// // // export interface StockResult {
// // //   success: boolean;
// // //   updated: string[];
// // //   skipped: string[];
// // //   errors:  string[];
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // Core stock updater
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // async function applyStockDeltas(deltas: StockDelta[]): Promise<StockResult> {
// // //   const result: StockResult = { success: true, updated: [], skipped: [], errors: [] };

// // //   for (const { productId, sku, delta, reason } of deltas) {
// // //     try {
// // //       const res = await ProductModal.updateOne(
// // //         { _id: productId, "attributes.sku": sku },
// // //         { $inc: { "attributes.$[variant].stock.stockQuantity": delta } },
// // //         { arrayFilters: [{ "variant.sku": sku }] }
// // //       );

// // //       if (res.matchedCount === 0) {
// // //         result.skipped.push(sku);
// // //         console.warn(`[StockService] ⚠️ Variant not found | sku: ${sku}`);
// // //       } else {
// // //         result.updated.push(sku);
// // //         console.log(`[StockService] ✅ ${reason} | sku: ${sku} | delta: ${delta > 0 ? "+" : ""}${delta}`);
// // //       }
// // //     } catch (err: any) {
// // //       result.errors.push(`${sku}: ${err.message}`);
// // //       result.success = false;
// // //     }
// // //   }

// // //   return result;
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // PO status auto-sync after GRN
// // // //
// // // // RULE: Only touch "ordered" or "received" — never touch draft/cancelled
// // // // draft    → "ordered" : email middleware ne already kar diya
// // // // ordered  → "received": GRN fully accepted hone par (hum karte hain yahan)
// // // // cancelled→ kabhi nahi chhona
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // async function syncPOStatus(poId: string): Promise<void> {
// // // //   try {
// // // //     const [po, grns] = await Promise.all([
// // // //       PurchaseOrder.findById(poId).lean(),
// // // //       GrnModel.find({ purchaseOrderId: poId }).lean(),
// // // //     ]);

// // // //     if (!po) return;

// // // //     const currentStatus = (po as any).status;

// // // //     // Only auto-update if PO is in "ordered" state
// // // //     // "draft" already handled by email middleware
// // // //     // "cancelled" never touch
// // // //     if (!["ordered", "received"].includes(currentStatus)) {
// // // //       console.log(`[StockService] ⏭️ PO "${currentStatus}" — skipping auto-update`);
// // // //       return;
// // // //     }

// // // //     // Build ordered map: productId → total qty
// // // //     const orderedMap: Record<string, number> = {};
// // // //     for (const item of (po as any).items) {
// // // //       const key = String(item.productId);
// // // //       orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
// // // //     }

// // // //     // Build received map: productId → total accepted across ALL GRNs
// // // //     const receivedMap: Record<string, number> = {};
// // // //     for (const grn of grns) {
// // // //       for (const item of (grn as any).items) {
// // // //         const key = String(item.productId);
// // // //         receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
// // // //       }
// // // //     }

// // // //     const keys     = Object.keys(orderedMap);
// // // //     const fullyMet = keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);

// // // //     // partial → stays "ordered", fully done → "received"
// // // //     const newStatus = fullyMet ? "received" : "ordered";

// // // //     if (newStatus !== currentStatus) {
// // // //       await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
// // // //       console.log(`[StockService] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`);
// // // //     } else {
// // // //       console.log(`[StockService] ℹ️ PO status stays: "${currentStatus}" (partial receipt)`);
// // // //     }

// // // //   } catch (err: any) {
// // // //     console.error("[StockService] ⚠️ syncPOStatus failed:", err.message);
// // // //   }
// // // // }

// // // async function syncPOStatus(poId: string): Promise<void> {
// // //   try {
// // //     const [po, grns] = await Promise.all([
// // //       PurchaseOrder.findById(poId).lean(),
// // //       GrnModel.find({ purchaseOrderId: poId }).lean(),
// // //     ]);

// // //     if (!po) return;

// // //     const currentStatus = (po as any).status;

// // //     // ── ONLY skip cancelled — never touch a cancelled PO ─────────────────────
// // //     // draft / ordered / received → all eligible for auto-sync
// // //     if (currentStatus === "cancelled") {
// // //       console.log(`[StockService] ⏭️ PO "${(po as any).orderNumber}" is cancelled — skipping`);
// // //       return;
// // //     }

// // //     // ── Build ordered map: productId → total qty ordered ─────────────────────
// // //     const orderedMap: Record<string, number> = {};
// // //     for (const item of (po as any).items) {
// // //       const key = String(item.productId);
// // //       orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
// // //     }

// // //     // ── Build received map: productId → total acceptedQty across ALL GRNs ────
// // //     const receivedMap: Record<string, number> = {};
// // //     for (const grn of grns) {
// // //       for (const item of (grn as any).items) {
// // //         const key = String(item.productId);
// // //         receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
// // //       }
// // //     }

// // //     const keys     = Object.keys(orderedMap);
// // //     const fullyMet = keys.length > 0 && keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);
// // //     const anyMet   = keys.some(k => (receivedMap[k] || 0) > 0);

// // //     // ── Determine new status ──────────────────────────────────────────────────
// // //     let newStatus: string;
// // //     if (fullyMet) {
// // //       newStatus = "received";   // ✅ all items fully received
// // //     } else if (anyMet) {
// // //       newStatus = "ordered";    // partial — still waiting for rest
// // //     } else {
// // //       return;                   // nothing received yet — don't touch
// // //     }

// // //     // ── Update only if changed ────────────────────────────────────────────────
// // //     if (newStatus !== currentStatus) {
// // //       await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
// // //       console.log(
// // //         `[StockService] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`
// // //       );
// // //     } else {
// // //       console.log(
// // //         `[StockService] ℹ️ PO ${(po as any).orderNumber} stays "${currentStatus}" (partial receipt)`
// // //       );
// // //     }

// // //   } catch (err: any) {
// // //     console.error("[StockService] ⚠️ syncPOStatus failed:", err.message);
// // //   }
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // Discrepancy email to supplier
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // async function sendGRNDiscrepancyEmail(grn: any, po: any): Promise<void> {
// // //   try {
// // //     const discrepantItems = grn.items.filter(
// // //       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
// // //     );
// // //     if (discrepantItems.length === 0) return;

// // //     const supplierEmail: string =
// // //       po.supplier?.contactInformation?.emailAddress ||
// // //       po.supplier?.contactInformation?.email        ||
// // //       po.orderContactEmail || "";

// // //     if (!supplierEmail) {
// // //       console.warn(`[StockService] ⚠️ No supplier email — discrepancy email skipped`);
// // //       return;
// // //     }

// // //     const supplierName: string =
// // //       po.supplier?.contactInformation?.primaryContactName ||
// // //       po.supplier?.supplierIdentification?.legalBusinessName ||
// // //       "Supplier";

// // //     const totalRejected = discrepantItems.reduce((s: number, i: any) => s + (i.rejectedQuantity || 0), 0);
// // //     const totalDamaged  = discrepantItems.reduce((s: number, i: any) => s + (i.damageQuantity  || 0), 0);

// // //     const itemRows = discrepantItems.map((item: any) => `
// // //       <tr style="border-bottom:1px solid #e5e7eb;">
// // //         <td style="padding:12px;font-weight:500;">${item.productName || "N/A"}</td>
// // //         <td style="padding:12px;font-family:monospace;color:#6b7280;">${item.sku || "N/A"}</td>
// // //         <td style="padding:12px;text-align:center;">${item.receivedQuantity || 0}</td>
// // //         <td style="padding:12px;text-align:center;color:#16a34a;font-weight:600;">${item.acceptedQuantity || 0}</td>
// // //         <td style="padding:12px;text-align:center;color:#dc2626;font-weight:600;">${item.rejectedQuantity || 0}</td>
// // //         <td style="padding:12px;text-align:center;color:#d97706;font-weight:600;">${item.damageQuantity || 0}</td>
// // //         <td style="padding:12px;color:#6b7280;font-size:13px;">${item.notes || "—"}</td>
// // //       </tr>`).join("");

// // //     const html = `
// // //       <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#1f2937;">
// // //         <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:30px;border-radius:12px 12px 0 0;">
// // //           <h1 style="color:white;margin:0;font-size:22px;">⚠️ GRN Discrepancy Report</h1>
// // //           <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">GRN: <strong>${grn.grnNumber}</strong> | PO: <strong>${po.orderNumber}</strong></p>
// // //         </div>
// // //         <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;">
// // //           <p>Dear <strong>${supplierName}</strong>,</p>
// // //           <p style="color:#374151;line-height:1.6;">
// // //             We received your delivery on <strong>${new Date(grn.receivedDate || grn.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</strong>.
// // //             The following discrepancies were found:
// // //           </p>
// // //           <div style="display:flex;gap:16px;margin:20px 0;">
// // //             <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px 20px;text-align:center;">
// // //               <p style="margin:0;font-size:28px;font-weight:700;color:#dc2626;">${totalRejected}</p>
// // //               <p style="margin:4px 0 0;font-size:13px;color:#991b1b;">Units Rejected</p>
// // //             </div>
// // //             <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 20px;text-align:center;">
// // //               <p style="margin:0;font-size:28px;font-weight:700;color:#d97706;">${totalDamaged}</p>
// // //               <p style="margin:4px 0 0;font-size:13px;color:#92400e;">Units Damaged</p>
// // //             </div>
// // //             <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 20px;text-align:center;">
// // //               <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${totalRejected + totalDamaged}</p>
// // //               <p style="margin:4px 0 0;font-size:13px;color:#15803d;">Total Affected</p>
// // //             </div>
// // //           </div>
// // //           <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
// // //             <thead>
// // //               <tr style="background:#f3f4f6;">
// // //                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Product</th>
// // //                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">SKU</th>
// // //                 <th style="padding:12px;text-align:center;font-size:13px;color:#6b7280;">Received</th>
// // //                 <th style="padding:12px;text-align:center;font-size:13px;color:#16a34a;">Accepted</th>
// // //                 <th style="padding:12px;text-align:center;font-size:13px;color:#dc2626;">Rejected</th>
// // //                 <th style="padding:12px;text-align:center;font-size:13px;color:#d97706;">Damaged</th>
// // //                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Notes</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody>${itemRows}</tbody>
// // //           </table>
// // //           <div style="margin-top:24px;padding:16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;">
// // //             <p style="margin:0;font-weight:600;color:#92400e;">Action Required</p>
// // //             <p style="margin:8px 0 0;color:#78350f;font-size:14px;">
// // //               Please arrange replacement or credit note for the affected units.
// // //               Reference: <strong>${grn.grnNumber}</strong>
// // //             </p>
// // //           </div>
// // //           <p style="margin-top:24px;">Best regards,<br/>
// // //             <strong>${process.env.APP_NAME || "Inventory Pro"}</strong>
// // //           </p>
// // //         </div>
// // //         <div style="background:#1f2937;padding:16px;border-radius:0 0 12px 12px;text-align:center;">
// // //           <p style="color:#9ca3af;margin:0;font-size:12px;">Automated message from ${process.env.APP_NAME || "Inventory Pro"}</p>
// // //         </div>
// // //       </div>`;

// // //     const text = `GRN Discrepancy Report — ${grn.grnNumber}\nPO: ${po.orderNumber}\n\nDear ${supplierName},\n\nTotal Rejected: ${totalRejected}\nTotal Damaged: ${totalDamaged}\n\nPlease arrange replacement or credit note. Ref: ${grn.grnNumber}`;

// // //     await emailService["sendMail"]({
// // //       from:    `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
// // //       to:      supplierEmail,
// // //       subject: `⚠️ Discrepancy Report — ${grn.grnNumber} | ${totalRejected + totalDamaged} units affected`,
// // //       html,
// // //       text,
// // //     });

// // //     console.log(`[StockService] 📧 Discrepancy email → ${supplierEmail}`);
// // //   } catch (err: any) {
// // //     console.error("[StockService] ⚠️ Discrepancy email failed:", err.message);
// // //   }
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // PUBLIC: Apply GRN to stock
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // export async function applyGRNToStock(grnId: string): Promise<StockResult> {
// // //   try {
// // //     const grn = await GrnModel.findById(grnId).lean() as any;
// // //     if (!grn) throw new Error(`GRN not found: ${grnId}`);

// // //     // 1. Stock update (accepted qty only)
// // //     const deltas: StockDelta[] = grn.items
// // //       .filter((item: any) => (item.acceptedQuantity || 0) > 0)
// // //       .map((item: any) => ({
// // //         productId: String(item.productId),
// // //         sku:       item.sku,
// // //         delta:     item.acceptedQuantity,
// // //         reason:    `GRN ${grn.grnNumber}`,
// // //       }));

// // //     const result = deltas.length > 0
// // //       ? await applyStockDeltas(deltas)
// // //       : { success: true, updated: [], skipped: [], errors: [] };

// // //     // 2. Auto-sync PO status
// // //     await syncPOStatus(String(grn.purchaseOrderId));

// // //     // 3. Discrepancy email (if any rejections/damages)
// // //     const hasDiscrepancy = grn.items.some(
// // //       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
// // //     );

// // //     if (hasDiscrepancy) {
// // //       const po = await PurchaseOrder.findById(grn.purchaseOrderId)
// // //         .populate("supplier", "contactInformation supplierIdentification")
// // //         .lean();
// // //       if (po) await sendGRNDiscrepancyEmail(grn, po);
// // //     }

// // //     return result;
// // //   } catch (err: any) {
// // //     console.error("[StockService] applyGRNToStock failed:", err.message);
// // //     return { success: false, updated: [], skipped: [], errors: [err.message] };
// // //   }
// // // }

// // // // ─────────────────────────────────────────────────────────────────────────────
// // // // PUBLIC: Apply Goods Return to stock
// // // // ─────────────────────────────────────────────────────────────────────────────
// // // export async function applyReturnToStock(returnId: string): Promise<StockResult> {
// // //   try {
// // //     const goodsReturn = await GoodsReturn.findById(returnId).lean() as any;
// // //     if (!goodsReturn) throw new Error(`GoodsReturn not found: ${returnId}`);

// // //     const deltas: StockDelta[] = goodsReturn.items
// // //       .filter((item: any) => item.returnQty > 0 && item.productId && item.sku)
// // //       .map((item: any) => ({
// // //         productId: String(item.productId),
// // //         sku:       item.sku,
// // //         delta:     -item.returnQty,
// // //         reason:    `Return ${goodsReturn.grtnNumber}`,
// // //       }));

// // //     if (deltas.length === 0) {
// // //       console.warn(`[StockService] ⚠️ No traceable items in return ${goodsReturn.grtnNumber}`);
// // //       return { success: true, updated: [], skipped: [], errors: [] };
// // //     }

// // //     return await applyStockDeltas(deltas);
// // //   } catch (err: any) {
// // //     console.error("[StockService] applyReturnToStock failed:", err.message);
// // //     return { success: false, updated: [], skipped: [], errors: [err.message] };
// // //   }
// // // }










// // // services/stock.service.ts
// // import { ProductModal } from "../models/product.models";
// // import { PurchaseOrder } from "../models/purchaseOrder.model";
// // import { GrnModel }          from "../models/grn.models";
// // import { GoodsReturn }  from "../models/goodsReturn.model";
// // import { emailService } from "./email.service";

// // interface StockDelta {
// //   productId: string;
// //   sku:       string;
// //   delta:     number;
// //   reason:    string;
// // }

// // export interface StockResult {
// //   success: boolean;
// //   updated: string[];
// //   skipped: string[];
// //   errors:  string[];
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // Core stock updater
// // // ─────────────────────────────────────────────────────────────────────────────
// // async function applyStockDeltas(deltas: StockDelta[]): Promise<StockResult> {
// //   const result: StockResult = { success: true, updated: [], skipped: [], errors: [] };

// //   for (const { productId, sku, delta, reason } of deltas) {
// //     try {
// //       const res = await ProductModal.updateOne(
// //         { _id: productId, "attributes.sku": sku },
// //         { $inc: { "attributes.$[variant].stock.stockQuantity": delta } },
// //         { arrayFilters: [{ "variant.sku": sku }] }
// //       );

// //       if (res.matchedCount === 0) {
// //         result.skipped.push(sku);
// //         console.warn(`[StockService] ⚠️ Variant not found | sku: ${sku}`);
// //       } else {
// //         result.updated.push(sku);
// //         console.log(`[StockService] ✅ ${reason} | sku: ${sku} | delta: ${delta > 0 ? "+" : ""}${delta}`);
// //       }
// //     } catch (err: any) {
// //       result.errors.push(`${sku}: ${err.message}`);
// //       result.success = false;
// //     }
// //   }

// //   return result;
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // PO status auto-sync after GRN
// // //
// // // RULE: Only touch "ordered" or "received" — never touch draft/cancelled
// // // draft    → "ordered" : email middleware ne already kar diya
// // // ordered  → "received": GRN fully accepted hone par (hum karte hain yahan)
// // // cancelled→ kabhi nahi chhona
// // // ─────────────────────────────────────────────────────────────────────────────
// // async function syncPOStatus(poId: string): Promise<void> {
// //   try {
// //     const [po, grns] = await Promise.all([
// //       PurchaseOrder.findById(poId).lean(),
// //       GrnModel.find({ purchaseOrderId: poId }).lean(),
// //     ]);

// //     if (!po) return;

// //     const currentStatus = (po as any).status;

// //     // Only auto-update if PO is in "ordered" state
// //     // "draft" already handled by email middleware
// //     // "cancelled" never touch
// //     if (!["ordered", "received"].includes(currentStatus)) {
// //       console.log(`[StockService] ⏭️ PO "${currentStatus}" — skipping auto-update`);
// //       return;
// //     }

// //     // Build ordered map: productId → total qty
// //     const orderedMap: Record<string, number> = {};
// //     for (const item of (po as any).items) {
// //       const key = String(item.productId);
// //       orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
// //     }

// //     // Build received map: productId → total accepted across ALL GRNs
// //     const receivedMap: Record<string, number> = {};
// //     for (const grn of grns) {
// //       for (const item of (grn as any).items) {
// //         const key = String(item.productId);
// //         receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
// //       }
// //     }

// //     const keys     = Object.keys(orderedMap);
// //     const fullyMet = keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);

// //     // partial → stays "ordered", fully done → "received"
// //     const newStatus = fullyMet ? "received" : "ordered";

// //     if (newStatus !== currentStatus) {
// //       await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
// //       console.log(`[StockService] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`);
// //     } else {
// //       console.log(`[StockService] ℹ️ PO status stays: "${currentStatus}" (partial receipt)`);
// //     }

// //   } catch (err: any) {
// //     console.error("[StockService] ⚠️ syncPOStatus failed:", err.message);
// //   }
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // Discrepancy email to supplier
// // // ─────────────────────────────────────────────────────────────────────────────
// // async function sendGRNDiscrepancyEmail(grn: any, po: any): Promise<void> {
// //   try {
// //     const discrepantItems = grn.items.filter(
// //       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
// //     );
// //     if (discrepantItems.length === 0) return;

// //     const supplierEmail: string =
// //       po.supplier?.contactInformation?.emailAddress ||
// //       po.supplier?.contactInformation?.email        ||
// //       po.orderContactEmail || "";

// //     if (!supplierEmail) {
// //       console.warn(`[StockService] ⚠️ No supplier email — discrepancy email skipped`);
// //       return;
// //     }

// //     const supplierName: string =
// //       po.supplier?.contactInformation?.primaryContactName ||
// //       po.supplier?.supplierIdentification?.legalBusinessName ||
// //       "Supplier";

// //     const totalRejected = discrepantItems.reduce((s: number, i: any) => s + (i.rejectedQuantity || 0), 0);
// //     const totalDamaged  = discrepantItems.reduce((s: number, i: any) => s + (i.damageQuantity  || 0), 0);

// //     const itemRows = discrepantItems.map((item: any) => `
// //       <tr style="border-bottom:1px solid #e5e7eb;">
// //         <td style="padding:12px;font-weight:500;">${item.productName || "N/A"}</td>
// //         <td style="padding:12px;font-family:monospace;color:#6b7280;">${item.sku || "N/A"}</td>
// //         <td style="padding:12px;text-align:center;">${item.receivedQuantity || 0}</td>
// //         <td style="padding:12px;text-align:center;color:#16a34a;font-weight:600;">${item.acceptedQuantity || 0}</td>
// //         <td style="padding:12px;text-align:center;color:#dc2626;font-weight:600;">${item.rejectedQuantity || 0}</td>
// //         <td style="padding:12px;text-align:center;color:#d97706;font-weight:600;">${item.damageQuantity || 0}</td>
// //         <td style="padding:12px;color:#6b7280;font-size:13px;">${item.notes || "—"}</td>
// //       </tr>`).join("");

// //     const html = `
// //       <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#1f2937;">
// //         <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:30px;border-radius:12px 12px 0 0;">
// //           <h1 style="color:white;margin:0;font-size:22px;">⚠️ GRN Discrepancy Report</h1>
// //           <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">GRN: <strong>${grn.grnNumber}</strong> | PO: <strong>${po.orderNumber}</strong></p>
// //         </div>
// //         <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;">
// //           <p>Dear <strong>${supplierName}</strong>,</p>
// //           <p style="color:#374151;line-height:1.6;">
// //             We received your delivery on <strong>${new Date(grn.receivedDate || grn.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</strong>.
// //             The following discrepancies were found:
// //           </p>
// //           <div style="display:flex;gap:16px;margin:20px 0;">
// //             <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px 20px;text-align:center;">
// //               <p style="margin:0;font-size:28px;font-weight:700;color:#dc2626;">${totalRejected}</p>
// //               <p style="margin:4px 0 0;font-size:13px;color:#991b1b;">Units Rejected</p>
// //             </div>
// //             <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 20px;text-align:center;">
// //               <p style="margin:0;font-size:28px;font-weight:700;color:#d97706;">${totalDamaged}</p>
// //               <p style="margin:4px 0 0;font-size:13px;color:#92400e;">Units Damaged</p>
// //             </div>
// //             <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 20px;text-align:center;">
// //               <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${totalRejected + totalDamaged}</p>
// //               <p style="margin:4px 0 0;font-size:13px;color:#15803d;">Total Affected</p>
// //             </div>
// //           </div>
// //           <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
// //             <thead>
// //               <tr style="background:#f3f4f6;">
// //                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Product</th>
// //                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">SKU</th>
// //                 <th style="padding:12px;text-align:center;font-size:13px;color:#6b7280;">Received</th>
// //                 <th style="padding:12px;text-align:center;font-size:13px;color:#16a34a;">Accepted</th>
// //                 <th style="padding:12px;text-align:center;font-size:13px;color:#dc2626;">Rejected</th>
// //                 <th style="padding:12px;text-align:center;font-size:13px;color:#d97706;">Damaged</th>
// //                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Notes</th>
// //               </tr>
// //             </thead>
// //             <tbody>${itemRows}</tbody>
// //           </table>
// //           <div style="margin-top:24px;padding:16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;">
// //             <p style="margin:0;font-weight:600;color:#92400e;">Action Required</p>
// //             <p style="margin:8px 0 0;color:#78350f;font-size:14px;">
// //               Please arrange replacement or credit note for the affected units.
// //               Reference: <strong>${grn.grnNumber}</strong>
// //             </p>
// //           </div>
// //           <p style="margin-top:24px;">Best regards,<br/>
// //             <strong>${process.env.APP_NAME || "Inventory Pro"}</strong>
// //           </p>
// //         </div>
// //         <div style="background:#1f2937;padding:16px;border-radius:0 0 12px 12px;text-align:center;">
// //           <p style="color:#9ca3af;margin:0;font-size:12px;">Automated message from ${process.env.APP_NAME || "Inventory Pro"}</p>
// //         </div>
// //       </div>`;

// //     const text = `GRN Discrepancy Report — ${grn.grnNumber}\nPO: ${po.orderNumber}\n\nDear ${supplierName},\n\nTotal Rejected: ${totalRejected}\nTotal Damaged: ${totalDamaged}\n\nPlease arrange replacement or credit note. Ref: ${grn.grnNumber}`;

// //     await emailService["sendMail"]({
// //       from:    `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
// //       to:      supplierEmail,
// //       subject: `⚠️ Discrepancy Report — ${grn.grnNumber} | ${totalRejected + totalDamaged} units affected`,
// //       html,
// //       text,
// //     });

// //     console.log(`[StockService] 📧 Discrepancy email → ${supplierEmail}`);
// //   } catch (err: any) {
// //     console.error("[StockService] ⚠️ Discrepancy email failed:", err.message);
// //   }
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // PUBLIC: Apply GRN to stock
// // // ─────────────────────────────────────────────────────────────────────────────
// // export async function applyGRNToStock(grnId: string): Promise<StockResult> {
// //   try {
// //     console.log("🚀 applyGRNToStock called for GRN:", grnId);
    
// //     const grn = await GrnModel.findById(grnId).lean() as any;
// //     if (!grn) throw new Error(`GRN not found: ${grnId}`);
    

// //     // 1. Stock update (accepted qty only)
// //     const deltas: StockDelta[] = grn.items
// //       .filter((item: any) => (item.acceptedQuantity || 0) > 0)
// //       .map((item: any) => ({
// //         productId: String(item.productId),
// //         sku:       item.sku,
// //         delta:     item.acceptedQuantity,
// //         reason:    `GRN ${grn.grnNumber}`,
// //       }));

// //     // 2. PO Status Update - Forcefully karo
    
// //     const updateResult = await PurchaseOrder.findByIdAndUpdate(
// //       grn.purchaseOrderId,
// //       { 
// //         status: "received",
// //         receivedAt: new Date()
// //       },
// //       { new: true } // ← IMPORTANT: Updated document return karo
// //     );
    
    

// //     if (!updateResult) {
// //       console.error("❌ PO not found with ID:", grn.purchaseOrderId);
// //     }

// //     // 3. Stock deltas apply karo
// //     const result = deltas.length > 0
// //       ? await applyStockDeltas(deltas)
// //       : { success: true, updated: [], skipped: [], errors: [] };

// //     // 4. Sync PO status (yeh already update kar chuke hain, isliye comment kar do)
// //     // await syncPOStatus(String(grn.purchaseOrderId));

// //     // 5. Discrepancy email
// //     const hasDiscrepancy = grn.items.some(
// //       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
// //     );

// //     if (hasDiscrepancy) {
// //       const po = await PurchaseOrder.findById(grn.purchaseOrderId)
// //         .populate("supplier", "contactInformation supplierIdentification")
// //         .lean();
// //       if (po) await sendGRNDiscrepancyEmail(grn, po);
// //     }

// //     console.log("✅ applyGRNToStock completed successfully");
// //     return result;
    
// //   } catch (err: any) {
// //     console.error("❌ [StockService] applyGRNToStock failed:", err.message);
// //     return { success: false, updated: [], skipped: [], errors: [err.message] };
// //   }
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // // PUBLIC: Apply Goods Return to stock
// // // ─────────────────────────────────────────────────────────────────────────────
// // export async function applyReturnToStock(returnId: string): Promise<StockResult> {
// //   try {
// //     const goodsReturn = await GoodsReturn.findById(returnId).lean() as any;
// //     if (!goodsReturn) throw new Error(`GoodsReturn not found: ${returnId}`);

// //     const deltas: StockDelta[] = goodsReturn.items
// //       .filter((item: any) => item.returnQty > 0 && item.productId && item.sku)
// //       .map((item: any) => ({
// //         productId: String(item.productId),
// //         sku:       item.sku,
// //         delta:     -item.returnQty,
// //         reason:    `Return ${goodsReturn.grtnNumber}`,
// //       }));

// //     if (deltas.length === 0) {
// //       console.warn(`[StockService] ⚠️ No traceable items in return ${goodsReturn.grtnNumber}`);
// //       return { success: true, updated: [], skipped: [], errors: [] };
// //     }

// //     return await applyStockDeltas(deltas);
// //   } catch (err: any) {
// //     console.error("[StockService] applyReturnToStock failed:", err.message);
// //     return { success: false, updated: [], skipped: [], errors: [err.message] };
// //   }
// // }


// // services/stock.service.ts
// import { ProductModal }  from "../models/product.models";
// import { PurchaseOrder } from "../models/purchaseOrder.model";
// import { GrnModel }      from "../models/grn.models";
// import { GoodsReturn }   from "../models/goodsReturn.model";
// import { emailService }  from "./email.service";
// import { createDebitEntry } from "./ledger.service";

// interface StockDelta {
//   productId: string;
//   sku:       string;
//   delta:     number;
//   reason:    string;
// }

// export interface StockResult {
//   success: boolean;
//   updated: string[];
//   skipped: string[];
//   errors:  string[];
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Core stock updater
// // ─────────────────────────────────────────────────────────────────────────────
// async function applyStockDeltas(deltas: StockDelta[]): Promise<StockResult> {
//   const result: StockResult = { success: true, updated: [], skipped: [], errors: [] };

//   for (const { productId, sku, delta, reason } of deltas) {
//     try {
//       console.log(`[Stock] Updating sku=${sku}, delta=${delta > 0 ? "+" : ""}${delta}`);

//       // ── Pehle product dhundo by _id ──────────────────────────────────────
//       // GRN mein product root-level sku hoti hai, attributes[].sku alag hoti hai
//       // isliye "attributes.sku" se match nahi karta
//       const product = await ProductModal.findOne({ _id: productId }).lean() as any;

//       if (!product) {
//         result.skipped.push(sku);
//         console.warn(`[Stock] ⚠️ Product not found | productId=${productId}`);
//         continue;
//       }

//       // ── Attributes mein se pehla wala use karo (ya supplierId se match karo) ──
//       // Agar single variant hai → index 0
//       // Agar multiple variants hain → supplierId se match karo
//       const attrs: any[] = product.attributes ?? [];

//       // Try: supplierId se match karo (most accurate)
//       // Fallback: pehla attribute
//       let targetIndex = attrs.findIndex(
//         (a: any) => String(a.stock?.supplierId) === String(productId)
//       );
//       if (targetIndex === -1) targetIndex = 0; // fallback to first

//       if (attrs.length === 0) {
//         result.skipped.push(sku);
//         console.warn(`[Stock] ⚠️ No attributes found for product | productId=${productId}`);
//         continue;
//       }

//       // ── Direct index se update karo ──────────────────────────────────────
//       const res = await ProductModal.updateOne(
//         { _id: productId },
//         { $inc: { [`attributes.${targetIndex}.stock.stockQuantity`]: delta } }
//       );

//       console.log(`[Stock] matchedCount=${res.matchedCount} modifiedCount=${res.modifiedCount}`);

//       if (res.matchedCount === 0) {
//         result.skipped.push(sku);
//         console.warn(`[Stock] ⚠️ Product/SKU not found | sku=${sku} productId=${productId}`);
//       } else if (res.modifiedCount === 0) {
//         result.skipped.push(sku);
//         console.warn(`[Stock] ⚠️ Matched but not modified | sku=${sku} — stock path check karo`);
//       } else {
//         result.updated.push(sku);
//         console.log(`[Stock] ✅ ${reason} | sku=${sku} | ${delta > 0 ? "+" : ""}${delta}`);
//       }
//     } catch (err: any) {
//       result.errors.push(`${sku}: ${err.message}`);
//       result.success = false;
//       console.error(`[Stock] ❌ Error updating sku=${sku}:`, err.message);
//     }
//   }

//   return result;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PO status auto-sync
// // ─────────────────────────────────────────────────────────────────────────────
// async function syncPOStatus(poId: string): Promise<void> {
//   try {
//     const [po, allGRNs] = await Promise.all([
//       PurchaseOrder.findById(poId).lean(),
//       GrnModel.find({ purchaseOrderId: poId }).lean(),
//     ]);

//     if (!po) { console.warn(`[Stock] ⚠️ PO not found: ${poId}`); return; }

//     const currentStatus = (po as any).status;
//     if (currentStatus === "cancelled") return;

//     const orderedMap: Record<string, number> = {};
//     for (const item of (po as any).items ?? []) {
//       const key = String(item.productId);
//       orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
//     }

//     const receivedMap: Record<string, number> = {};
//     for (const grn of allGRNs) {
//       for (const item of (grn as any).items ?? []) {
//         const key = String(item.productId);
//         receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
//       }
//     }

//     const keys     = Object.keys(orderedMap);
//     const fullyMet = keys.length > 0 && keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);
//     const anyMet   = keys.some(k => (receivedMap[k] || 0) > 0);

//     const newStatus = fullyMet ? "received" : anyMet ? "ordered" : null;
//     if (!newStatus || newStatus === currentStatus) return;

//     await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
//     console.log(`[Stock] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`);

//   } catch (err: any) {
//     console.error("[Stock] ⚠️ syncPOStatus failed:", err.message);
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Discrepancy email
// // ─────────────────────────────────────────────────────────────────────────────
// async function sendGRNDiscrepancyEmail(grn: any, po: any): Promise<void> {
//   try {
//     const discrepantItems = grn.items.filter(
//       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
//     );
//     if (discrepantItems.length === 0) return;

//     const supplierEmail: string =
//       po.supplier?.contactInformation?.emailAddress ||
//       po.supplier?.contactInformation?.email        ||
//       po.orderContactEmail || "";

//     if (!supplierEmail) {
//       console.warn(`[Stock] ⚠️ No supplier email — discrepancy email skipped`);
//       return;
//     }

//     const supplierName: string =
//       po.supplier?.contactInformation?.primaryContactName ||
//       po.supplier?.supplierIdentification?.legalBusinessName ||
//       "Supplier";

//     const totalRejected = discrepantItems.reduce((s: number, i: any) => s + (i.rejectedQuantity || 0), 0);
//     const totalDamaged  = discrepantItems.reduce((s: number, i: any) => s + (i.damageQuantity  || 0), 0);

//     const itemRows = discrepantItems.map((item: any) => `
//       <tr style="border-bottom:1px solid #e5e7eb;">
//         <td style="padding:12px;font-weight:500;">${item.productName || "N/A"}</td>
//         <td style="padding:12px;font-family:monospace;color:#6b7280;">${item.sku || "N/A"}</td>
//         <td style="padding:12px;text-align:center;">${item.receivedQuantity || 0}</td>
//         <td style="padding:12px;text-align:center;color:#16a34a;font-weight:600;">${item.acceptedQuantity || 0}</td>
//         <td style="padding:12px;text-align:center;color:#dc2626;font-weight:600;">${item.rejectedQuantity || 0}</td>
//         <td style="padding:12px;text-align:center;color:#d97706;font-weight:600;">${item.damageQuantity || 0}</td>
//         <td style="padding:12px;color:#6b7280;font-size:13px;">${item.notes || "—"}</td>
//       </tr>`).join("");

//     const html = `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#1f2937;">
//         <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:30px;border-radius:12px 12px 0 0;">
//           <h1 style="color:white;margin:0;font-size:22px;">⚠️ GRN Discrepancy Report</h1>
//           <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">GRN: <strong>${grn.grnNumber}</strong> | PO: <strong>${po.orderNumber}</strong></p>
//         </div>
//         <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;">
//           <p>Dear <strong>${supplierName}</strong>,</p>
//           <p style="color:#374151;line-height:1.6;">
//             We received your delivery on <strong>${new Date(grn.receivedDate || grn.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</strong>.
//             The following discrepancies were found:
//           </p>
//           <div style="display:flex;gap:16px;margin:20px 0;">
//             <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px 20px;text-align:center;">
//               <p style="margin:0;font-size:28px;font-weight:700;color:#dc2626;">${totalRejected}</p>
//               <p style="margin:4px 0 0;font-size:13px;color:#991b1b;">Units Rejected</p>
//             </div>
//             <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 20px;text-align:center;">
//               <p style="margin:0;font-size:28px;font-weight:700;color:#d97706;">${totalDamaged}</p>
//               <p style="margin:4px 0 0;font-size:13px;color:#92400e;">Units Damaged</p>
//             </div>
//             <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 20px;text-align:center;">
//               <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${totalRejected + totalDamaged}</p>
//               <p style="margin:4px 0 0;font-size:13px;color:#15803d;">Total Affected</p>
//             </div>
//           </div>
//           <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
//             <thead>
//               <tr style="background:#f3f4f6;">
//                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Product</th>
//                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">SKU</th>
//                 <th style="padding:12px;text-align:center;font-size:13px;color:#6b7280;">Received</th>
//                 <th style="padding:12px;text-align:center;font-size:13px;color:#16a34a;">Accepted</th>
//                 <th style="padding:12px;text-align:center;font-size:13px;color:#dc2626;">Rejected</th>
//                 <th style="padding:12px;text-align:center;font-size:13px;color:#d97706;">Damaged</th>
//                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Notes</th>
//               </tr>
//             </thead>
//             <tbody>${itemRows}</tbody>
//           </table>
//           <div style="margin-top:24px;padding:16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;">
//             <p style="margin:0;font-weight:600;color:#92400e;">Action Required</p>
//             <p style="margin:8px 0 0;color:#78350f;font-size:14px;">
//               Please arrange replacement or credit note.
//               Reference: <strong>${grn.grnNumber}</strong>
//             </p>
//           </div>
//           <p style="margin-top:24px;">Best regards,<br/>
//             <strong>${process.env.APP_NAME || "Inventory Pro"}</strong>
//           </p>
//         </div>
//         <div style="background:#1f2937;padding:16px;border-radius:0 0 12px 12px;text-align:center;">
//           <p style="color:#9ca3af;margin:0;font-size:12px;">Automated message from ${process.env.APP_NAME || "Inventory Pro"}</p>
//         </div>
//       </div>`;

//     await emailService["sendMail"]({
//       from:    `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//       to:      supplierEmail,
//       subject: `⚠️ Discrepancy Report — ${grn.grnNumber} | ${totalRejected + totalDamaged} units affected`,
//       html,
//       text:    `GRN Discrepancy — ${grn.grnNumber}. Rejected: ${totalRejected}, Damaged: ${totalDamaged}`,
//     });

//     console.log(`[Stock] 📧 Discrepancy email → ${supplierEmail}`);
//   } catch (err: any) {
//     console.error("[Stock] ⚠️ Discrepancy email failed:", err.message);
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PUBLIC: GRN se stock apply karo
// // ─────────────────────────────────────────────────────────────────────────────
// export async function applyGRNToStock(grnId: string): Promise<StockResult> {
//   try {
//     console.log(`[Stock] 🚀 START | grnId=${grnId}`);

//     const grn = await GrnModel.findById(grnId).lean() as any;
//     if (!grn) throw new Error(`GRN not found: ${grnId}`);

//     console.log(`[Stock] GRN: ${grn.grnNumber} | items: ${grn.items?.length}`);
//     console.log(`[Stock] Items:`, grn.items?.map((i: any) => ({
//       sku: i.sku, productId: i.productId, accepted: i.acceptedQuantity,
//     })));

//     // ── STEP 1: Stock update ──────────────────────────────────────────────
//     const deltas: StockDelta[] = (grn.items ?? [])
//       .filter((item: any) => (item.acceptedQuantity || 0) > 0)
//       .map((item: any) => ({
//         productId: String(item.productId),
//         sku:       item.sku,
//         delta:     item.acceptedQuantity,
//         reason:    `GRN ${grn.grnNumber}`,
//       }));

//     if (deltas.length === 0) {
//       console.warn(`[Stock] ⚠️ No accepted items — nothing to update`);
//     }

//     const result = deltas.length > 0
//       ? await applyStockDeltas(deltas)
//       : { success: true, updated: [], skipped: [], errors: [] };

//     // ── STEP 2: PO status sync ────────────────────────────────────────────
//     await syncPOStatus(String(grn.purchaseOrderId));

//     // ── STEP 3: Discrepancy email ─────────────────────────────────────────
//     const hasDiscrepancy = (grn.items ?? []).some(
//       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
//     );
//     if (hasDiscrepancy) {
//       const po = await PurchaseOrder
//         .findById(grn.purchaseOrderId)
//         .populate("supplier", "contactInformation supplierIdentification")
//         .lean();
//       if (po) sendGRNDiscrepancyEmail(grn, po).catch(console.error);
//     }

//     // ── STEP 4: Ledger DEBIT ──────────────────────────────────────────────
//     try {
//       const po = await PurchaseOrder.findById(grn.purchaseOrderId).select("supplier").lean() as any;
//       const supplierId = po?.supplier;
//       const totalAmount =
//         grn.totalAmount ||
//         (grn.items ?? []).reduce((s: number, i: any) =>
//           s + (i.acceptedQuantity || 0) * (i.unitPrice || 0), 0);

//       if (supplierId && totalAmount > 0) {
//         await createDebitEntry({
//           supplierId:      String(supplierId),
//           amount:          totalAmount,
//           referenceType:   "GRN",
//           referenceId:     grn._id,
//           referenceNumber: grn.grnNumber,
//           notes:           `GRN received: ${grn.grnNumber}`,
//           createdBy:       "system",
//         });
//         console.log(`[Stock] 💰 Ledger DEBIT | ${grn.grnNumber} | £${totalAmount}`);
//       }
//     } catch (ledgerErr: any) {
//       console.error(`[Stock] ❌ Ledger DEBIT failed:`, ledgerErr.message);
//     }

//     console.log(`[Stock] ✅ DONE | updated=[${result.updated}] skipped=[${result.skipped}]`);
//     return result;

//   } catch (err: any) {
//     console.error(`[Stock] ❌ FAILED:`, err.message);
//     return { success: false, updated: [], skipped: [], errors: [err.message] };
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PUBLIC: Goods Return se stock kam karo
// // ─────────────────────────────────────────────────────────────────────────────
// export async function applyReturnToStock(returnId: string): Promise<StockResult> {
//   try {
//     const goodsReturn = await GoodsReturn.findById(returnId).lean() as any;
//     if (!goodsReturn) throw new Error(`GoodsReturn not found: ${returnId}`);

//     const deltas: StockDelta[] = (goodsReturn.items ?? [])
//       .filter((item: any) => item.returnQty > 0 && item.productId && item.sku)
//       .map((item: any) => ({
//         productId: String(item.productId),
//         sku:       item.sku,
//         delta:     -item.returnQty,
//         reason:    `Return ${goodsReturn.grtnNumber}`,
//       }));

//     if (deltas.length === 0) {
//       console.warn(`[Stock] ⚠️ No traceable items in return ${goodsReturn.grtnNumber}`);
//       return { success: true, updated: [], skipped: [], errors: [] };
//     }

//     return await applyStockDeltas(deltas);
//   } catch (err: any) {
//     console.error("[Stock] applyReturnToStock failed:", err.message);
//     return { success: false, updated: [], skipped: [], errors: [err.message] };
//   }
// }





// services/stock.service.ts
import { ProductModal }  from "../models/product.models";
import { PurchaseOrder } from "../models/purchaseOrder.model";
import { GrnModel }      from "../models/grn.models";
import { GoodsReturn }   from "../models/goodsReturn.model";
import { emailService }  from "./email.service";
import { createDebitEntry } from "./ledger.service";

interface StockDelta {
  productId: string;
  sku:       string;
  delta:     number;
  reason:    string;
}

export interface StockResult {
  success: boolean;
  updated: string[];
  skipped: string[];
  errors:  string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculate stockStatus from actual numbers — SINGLE source of truth
// Schema mein: "in-stock" | "low-stock" | "out-of-stock"
//
// RULE:
//   qty <= 0                → "out-of-stock"
//   qty <= safetyStock      → "low-stock"   (buffer se kam)
//   qty <= minStockLevel    → "low-stock"   (minimum se kam)
//   qty <= reorderPoint     → "low-stock"   (reorder trigger)
//   else                    → "in-stock"
// ─────────────────────────────────────────────────────────────────────────────
function calculateStockStatus(stock: {
  stockQuantity: number;
  safetyStock?:  number;
  minStockLevel?: number;
  reorderPoint?:  number;
}): "in-stock" | "low-stock" | "out-of-stock" {
  const qty         = stock.stockQuantity   ?? 0;
  const safety      = stock.safetyStock     ?? 0;
  const minLevel    = stock.minStockLevel   ?? 0;
  const reorder     = stock.reorderPoint    ?? 0;

  if (qty <= 0)       return "out-of-stock";
  if (safety  > 0 && qty <= safety)   return "low-stock";
  if (minLevel > 0 && qty <= minLevel) return "low-stock";
  if (reorder  > 0 && qty <= reorder)  return "low-stock";

  return "in-stock";
}

// ─────────────────────────────────────────────────────────────────────────────
// After every stock change → recalculate and save stockStatus to DB
// ─────────────────────────────────────────────────────────────────────────────
async function syncStockStatus(productId: string, attrIndex: number): Promise<void> {
  try {
    const product = await ProductModal.findById(productId).lean() as any;
    const stock   = product?.attributes?.[attrIndex]?.stock;
    if (!stock) return;

    const newStatus = calculateStockStatus(stock);
    const oldStatus = stock.stockStatus;

    if (newStatus === oldStatus) return; // no change needed

    await ProductModal.updateOne(
      { _id: productId },
      { $set: { [`attributes.${attrIndex}.stock.stockStatus`]: newStatus } }
    );

    console.log(
      `[Stock] 🏷️ stockStatus updated | productId=${productId} | "${oldStatus}" → "${newStatus}" | qty=${stock.stockQuantity}`
    );
  } catch (err: any) {
    // Never block main flow
    console.error(`[Stock] ⚠️ syncStockStatus failed:`, err.message);
  }
}

async function applyStockDeltas(deltas: StockDelta[]): Promise<StockResult> {
  const result: StockResult = { success: true, updated: [], skipped: [], errors: [] };

  for (const { productId, sku, delta, reason } of deltas) {
    try {
      console.log(`[Stock] Updating sku=${sku}, delta=${delta > 0 ? "+" : ""}${delta}`);

      // ── Pehle product dhundo by _id ──────────────────────────────────────
      // GRN mein product root-level sku hoti hai, attributes[].sku alag hoti hai
      // isliye "attributes.sku" se match nahi karta
      const product = await ProductModal.findOne({ _id: productId }).lean() as any;

      if (!product) {
        result.skipped.push(sku);
        console.warn(`[Stock] ⚠️ Product not found | productId=${productId}`);
        continue;
      }

      // ── Attributes mein se pehla wala use karo (ya supplierId se match karo) ──
      // Agar single variant hai → index 0
      // Agar multiple variants hain → supplierId se match karo
      const attrs: any[] = product.attributes ?? [];

      // Try 1: attributes[].sku se GRN ki sku match karo
      // Try 2: product root sku se match karo
      // Fallback: index 0 (single variant product)
      let targetIndex = attrs.findIndex((a: any) => a.sku === sku);
      if (targetIndex === -1) targetIndex = attrs.findIndex((a: any) => a.sku === product.sku);
      if (targetIndex === -1) targetIndex = 0; // fallback — single variant

      console.log(`[Stock] targetIndex=${targetIndex} | attrs count=${attrs.length}`);

      if (attrs.length === 0) {
        result.skipped.push(sku);
        console.warn(`[Stock] ⚠️ No attributes found for product | productId=${productId}`);
        continue;
      }

      // ── Direct index se update karo ──────────────────────────────────────
      const res = await ProductModal.updateOne(
        { _id: productId },
        { $inc: { [`attributes.${targetIndex}.stock.stockQuantity`]: delta } }
      );

      console.log(`[Stock] matchedCount=${res.matchedCount} modifiedCount=${res.modifiedCount}`);

      if (res.matchedCount === 0) {
        result.skipped.push(sku);
        console.warn(`[Stock] ⚠️ Product/SKU not found | sku=${sku} productId=${productId}`);
      } else if (res.modifiedCount === 0) {
        result.skipped.push(sku);
        console.warn(`[Stock] ⚠️ Matched but not modified | sku=${sku} — stock path check karo`);
      } else {
        result.updated.push(sku);
        console.log(`[Stock] ✅ ${reason} | sku=${sku} | ${delta > 0 ? "+" : ""}${delta}`);

        // ✅ stockStatus auto-recalculate karo — fire and forget
        syncStockStatus(productId, targetIndex).catch(console.error);
      }
    } catch (err: any) {
      result.errors.push(`${sku}: ${err.message}`);
      result.success = false;
      console.error(`[Stock] ❌ Error updating sku=${sku}:`, err.message);
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// PO status auto-sync
// ─────────────────────────────────────────────────────────────────────────────
async function syncPOStatus(poId: string): Promise<void> {
  try {
    const [po, allGRNs] = await Promise.all([
      PurchaseOrder.findById(poId).lean(),
      GrnModel.find({ purchaseOrderId: poId }).lean(),
    ]);

    if (!po) { console.warn(`[Stock] ⚠️ PO not found: ${poId}`); return; }

    const currentStatus = (po as any).status;
    if (currentStatus === "cancelled") return;

    const orderedMap: Record<string, number> = {};
    for (const item of (po as any).items ?? []) {
      const key = String(item.productId);
      orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
    }

    const receivedMap: Record<string, number> = {};
    for (const grn of allGRNs) {
      for (const item of (grn as any).items ?? []) {
        const key = String(item.productId);
        receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
      }
    }

    const keys     = Object.keys(orderedMap);
    const fullyMet = keys.length > 0 && keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);
    const anyMet   = keys.some(k => (receivedMap[k] || 0) > 0);

    const newStatus = fullyMet ? "received" : anyMet ? "ordered" : null;
    if (!newStatus || newStatus === currentStatus) return;

    await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
    console.log(`[Stock] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`);

  } catch (err: any) {
    console.error("[Stock] ⚠️ syncPOStatus failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Discrepancy email
// ─────────────────────────────────────────────────────────────────────────────
async function sendGRNDiscrepancyEmail(grn: any, po: any): Promise<void> {
  try {
    const discrepantItems = grn.items.filter(
      (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
    );
    if (discrepantItems.length === 0) return;

    const supplierEmail: string =
      po.supplier?.contactInformation?.emailAddress ||
      po.supplier?.contactInformation?.email        ||
      po.orderContactEmail || "";

    if (!supplierEmail) {
      console.warn(`[Stock] ⚠️ No supplier email — discrepancy email skipped`);
      return;
    }

    const supplierName: string =
      po.supplier?.contactInformation?.primaryContactName ||
      po.supplier?.supplierIdentification?.legalBusinessName ||
      "Supplier";

    const totalRejected = discrepantItems.reduce((s: number, i: any) => s + (i.rejectedQuantity || 0), 0);
    const totalDamaged  = discrepantItems.reduce((s: number, i: any) => s + (i.damageQuantity  || 0), 0);

    const itemRows = discrepantItems.map((item: any) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px;font-weight:500;">${item.productName || "N/A"}</td>
        <td style="padding:12px;font-family:monospace;color:#6b7280;">${item.sku || "N/A"}</td>
        <td style="padding:12px;text-align:center;">${item.receivedQuantity || 0}</td>
        <td style="padding:12px;text-align:center;color:#16a34a;font-weight:600;">${item.acceptedQuantity || 0}</td>
        <td style="padding:12px;text-align:center;color:#dc2626;font-weight:600;">${item.rejectedQuantity || 0}</td>
        <td style="padding:12px;text-align:center;color:#d97706;font-weight:600;">${item.damageQuantity || 0}</td>
        <td style="padding:12px;color:#6b7280;font-size:13px;">${item.notes || "—"}</td>
      </tr>`).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#1f2937;">
        <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:30px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">⚠️ GRN Discrepancy Report</h1>
          <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">GRN: <strong>${grn.grnNumber}</strong> | PO: <strong>${po.orderNumber}</strong></p>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;">
          <p>Dear <strong>${supplierName}</strong>,</p>
          <p style="color:#374151;line-height:1.6;">
            We received your delivery on <strong>${new Date(grn.receivedDate || grn.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</strong>.
            The following discrepancies were found:
          </p>
          <div style="display:flex;gap:16px;margin:20px 0;">
            <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:12px 20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:#dc2626;">${totalRejected}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#991b1b;">Units Rejected</p>
            </div>
            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:#d97706;">${totalDamaged}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#92400e;">Units Damaged</p>
            </div>
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 20px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:700;color:#16a34a;">${totalRejected + totalDamaged}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#15803d;">Total Affected</p>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Product</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">SKU</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#6b7280;">Received</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#16a34a;">Accepted</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#dc2626;">Rejected</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#d97706;">Damaged</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Notes</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="margin-top:24px;padding:16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;">
            <p style="margin:0;font-weight:600;color:#92400e;">Action Required</p>
            <p style="margin:8px 0 0;color:#78350f;font-size:14px;">
              Please arrange replacement or credit note.
              Reference: <strong>${grn.grnNumber}</strong>
            </p>
          </div>
          <p style="margin-top:24px;">Best regards,<br/>
            <strong>${process.env.APP_NAME || "Inventory Pro"}</strong>
          </p>
        </div>
        <div style="background:#1f2937;padding:16px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="color:#9ca3af;margin:0;font-size:12px;">Automated message from ${process.env.APP_NAME || "Inventory Pro"}</p>
        </div>
      </div>`;

    await emailService["sendMail"]({
      from:    `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to:      supplierEmail,
      subject: `⚠️ Discrepancy Report — ${grn.grnNumber} | ${totalRejected + totalDamaged} units affected`,
      html,
      text:    `GRN Discrepancy — ${grn.grnNumber}. Rejected: ${totalRejected}, Damaged: ${totalDamaged}`,
    });

    console.log(`[Stock] 📧 Discrepancy email → ${supplierEmail}`);
  } catch (err: any) {
    console.error("[Stock] ⚠️ Discrepancy email failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: GRN se stock apply karo
// ─────────────────────────────────────────────────────────────────────────────
export async function applyGRNToStock(grnId: string): Promise<StockResult> {
  try {
    console.log(`[Stock] 🚀 START | grnId=${grnId}`);

    const grn = await GrnModel.findById(grnId).lean() as any;
    if (!grn) throw new Error(`GRN not found: ${grnId}`);

    console.log(`[Stock] GRN: ${grn.grnNumber} | items: ${grn.items?.length}`);
    console.log(`[Stock] Items:`, grn.items?.map((i: any) => ({
      sku: i.sku, productId: i.productId, accepted: i.acceptedQuantity,
    })));

    // ── STEP 1: Stock update ──────────────────────────────────────────────
    const deltas: StockDelta[] = (grn.items ?? [])
      .filter((item: any) => (item.acceptedQuantity || 0) > 0)
      .map((item: any) => ({
        productId: String(item.productId),
        sku:       item.sku,
        delta:     item.acceptedQuantity,
        reason:    `GRN ${grn.grnNumber}`,
      }));

    if (deltas.length === 0) {
      console.warn(`[Stock] ⚠️ No accepted items — nothing to update`);
    }

    const result = deltas.length > 0
      ? await applyStockDeltas(deltas)
      : { success: true, updated: [], skipped: [], errors: [] };

    // ── STEP 2: PO status sync ────────────────────────────────────────────
    await syncPOStatus(String(grn.purchaseOrderId));

    // ── STEP 3: Discrepancy email ─────────────────────────────────────────
    const hasDiscrepancy = (grn.items ?? []).some(
      (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
    );
    if (hasDiscrepancy) {
      const po = await PurchaseOrder
        .findById(grn.purchaseOrderId)
        .populate("supplier", "contactInformation supplierIdentification")
        .lean();
      if (po) sendGRNDiscrepancyEmail(grn, po).catch(console.error);
    }

    // ── STEP 4: Ledger DEBIT ──────────────────────────────────────────────
    try {
      const po = await PurchaseOrder.findById(grn.purchaseOrderId).select("supplier").lean() as any;
      const supplierId = po?.supplier;
      const totalAmount =
        grn.totalAmount ||
        (grn.items ?? []).reduce((s: number, i: any) =>
          s + (i.acceptedQuantity || 0) * (i.unitPrice || 0), 0);

      if (supplierId && totalAmount > 0) {
        await createDebitEntry({
          supplierId:      String(supplierId),
          amount:          totalAmount,
          referenceType:   "GRN",
          referenceId:     grn._id,
          referenceNumber: grn.grnNumber,
          notes:           `GRN received: ${grn.grnNumber}`,
          createdBy:       "system",
        });
        console.log(`[Stock] 💰 Ledger DEBIT | ${grn.grnNumber} | £${totalAmount}`);
      }
    } catch (ledgerErr: any) {
      console.error(`[Stock] ❌ Ledger DEBIT failed:`, ledgerErr.message);
    }

    console.log(`[Stock] ✅ DONE | updated=[${result.updated}] skipped=[${result.skipped}]`);
    return result;

  } catch (err: any) {
    console.error(`[Stock] ❌ FAILED:`, err.message);
    return { success: false, updated: [], skipped: [], errors: [err.message] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Goods Return se stock kam karo
// ─────────────────────────────────────────────────────────────────────────────
export async function applyReturnToStock(returnId: string): Promise<StockResult> {
  try {
    const goodsReturn = await GoodsReturn.findById(returnId).lean() as any;
    if (!goodsReturn) throw new Error(`GoodsReturn not found: ${returnId}`);

    const deltas: StockDelta[] = (goodsReturn.items ?? [])
      .filter((item: any) => item.returnQty > 0 && item.productId && item.sku)
      .map((item: any) => ({
        productId: String(item.productId),
        sku:       item.sku,
        delta:     -item.returnQty,
        reason:    `Return ${goodsReturn.grtnNumber}`,
      }));

    if (deltas.length === 0) {
      console.warn(`[Stock] ⚠️ No traceable items in return ${goodsReturn.grtnNumber}`);
      return { success: true, updated: [], skipped: [], errors: [] };
    }

    return await applyStockDeltas(deltas);
  } catch (err: any) {
    console.error("[Stock] applyReturnToStock failed:", err.message);
    return { success: false, updated: [], skipped: [], errors: [err.message] };
  }
}