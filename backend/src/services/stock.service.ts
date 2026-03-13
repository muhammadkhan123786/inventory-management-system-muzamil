// // // services/stock.service.ts
// // import { ProductModal } from "../models/product.models";
// // import { PurchaseOrder } from "../models/purchaseOrder.model";
// // import { GrnModel } from "../models/grn.models";
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
// // // async function syncPOStatus(poId: string): Promise<void> {
// // //   try {
// // //     const [po, grns] = await Promise.all([
// // //       PurchaseOrder.findById(poId).lean(),
// // //       GrnModel.find({ purchaseOrderId: poId }).lean(),
// // //     ]);

// // //     if (!po) return;

// // //     const currentStatus = (po as any).status;

// // //     // Only auto-update if PO is in "ordered" state
// // //     // "draft" already handled by email middleware
// // //     // "cancelled" never touch
// // //     if (!["ordered", "received"].includes(currentStatus)) {
// // //       console.log(`[StockService] ⏭️ PO "${currentStatus}" — skipping auto-update`);
// // //       return;
// // //     }

// // //     // Build ordered map: productId → total qty
// // //     const orderedMap: Record<string, number> = {};
// // //     for (const item of (po as any).items) {
// // //       const key = String(item.productId);
// // //       orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
// // //     }

// // //     // Build received map: productId → total accepted across ALL GRNs
// // //     const receivedMap: Record<string, number> = {};
// // //     for (const grn of grns) {
// // //       for (const item of (grn as any).items) {
// // //         const key = String(item.productId);
// // //         receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
// // //       }
// // //     }

// // //     const keys     = Object.keys(orderedMap);
// // //     const fullyMet = keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);

// // //     // partial → stays "ordered", fully done → "received"
// // //     const newStatus = fullyMet ? "received" : "ordered";

// // //     if (newStatus !== currentStatus) {
// // //       await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
// // //       console.log(`[StockService] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`);
// // //     } else {
// // //       console.log(`[StockService] ℹ️ PO status stays: "${currentStatus}" (partial receipt)`);
// // //     }

// // //   } catch (err: any) {
// // //     console.error("[StockService] ⚠️ syncPOStatus failed:", err.message);
// // //   }
// // // }

// // async function syncPOStatus(poId: string): Promise<void> {
// //   try {
// //     const [po, grns] = await Promise.all([
// //       PurchaseOrder.findById(poId).lean(),
// //       GrnModel.find({ purchaseOrderId: poId }).lean(),
// //     ]);

// //     if (!po) return;

// //     const currentStatus = (po as any).status;

// //     // ── ONLY skip cancelled — never touch a cancelled PO ─────────────────────
// //     // draft / ordered / received → all eligible for auto-sync
// //     if (currentStatus === "cancelled") {
// //       console.log(`[StockService] ⏭️ PO "${(po as any).orderNumber}" is cancelled — skipping`);
// //       return;
// //     }

// //     // ── Build ordered map: productId → total qty ordered ─────────────────────
// //     const orderedMap: Record<string, number> = {};
// //     for (const item of (po as any).items) {
// //       const key = String(item.productId);
// //       orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
// //     }

// //     // ── Build received map: productId → total acceptedQty across ALL GRNs ────
// //     const receivedMap: Record<string, number> = {};
// //     for (const grn of grns) {
// //       for (const item of (grn as any).items) {
// //         const key = String(item.productId);
// //         receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
// //       }
// //     }

// //     const keys     = Object.keys(orderedMap);
// //     const fullyMet = keys.length > 0 && keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);
// //     const anyMet   = keys.some(k => (receivedMap[k] || 0) > 0);

// //     // ── Determine new status ──────────────────────────────────────────────────
// //     let newStatus: string;
// //     if (fullyMet) {
// //       newStatus = "received";   // ✅ all items fully received
// //     } else if (anyMet) {
// //       newStatus = "ordered";    // partial — still waiting for rest
// //     } else {
// //       return;                   // nothing received yet — don't touch
// //     }

// //     // ── Update only if changed ────────────────────────────────────────────────
// //     if (newStatus !== currentStatus) {
// //       await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
// //       console.log(
// //         `[StockService] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`
// //       );
// //     } else {
// //       console.log(
// //         `[StockService] ℹ️ PO ${(po as any).orderNumber} stays "${currentStatus}" (partial receipt)`
// //       );
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

// //     const result = deltas.length > 0
// //       ? await applyStockDeltas(deltas)
// //       : { success: true, updated: [], skipped: [], errors: [] };

// //     // 2. Auto-sync PO status
// //     await syncPOStatus(String(grn.purchaseOrderId));

// //     // 3. Discrepancy email (if any rejections/damages)
// //     const hasDiscrepancy = grn.items.some(
// //       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
// //     );

// //     if (hasDiscrepancy) {
// //       const po = await PurchaseOrder.findById(grn.purchaseOrderId)
// //         .populate("supplier", "contactInformation supplierIdentification")
// //         .lean();
// //       if (po) await sendGRNDiscrepancyEmail(grn, po);
// //     }

// //     return result;
// //   } catch (err: any) {
// //     console.error("[StockService] applyGRNToStock failed:", err.message);
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
// import { ProductModal } from "../models/product.models";
// import { PurchaseOrder } from "../models/purchaseOrder.model";
// import { GrnModel }          from "../models/grn.models";
// import { GoodsReturn }  from "../models/goodsReturn.model";
// import { emailService } from "./email.service";

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
//       const res = await ProductModal.updateOne(
//         { _id: productId, "attributes.sku": sku },
//         { $inc: { "attributes.$[variant].stock.stockQuantity": delta } },
//         { arrayFilters: [{ "variant.sku": sku }] }
//       );

//       if (res.matchedCount === 0) {
//         result.skipped.push(sku);
//         console.warn(`[StockService] ⚠️ Variant not found | sku: ${sku}`);
//       } else {
//         result.updated.push(sku);
//         console.log(`[StockService] ✅ ${reason} | sku: ${sku} | delta: ${delta > 0 ? "+" : ""}${delta}`);
//       }
//     } catch (err: any) {
//       result.errors.push(`${sku}: ${err.message}`);
//       result.success = false;
//     }
//   }

//   return result;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PO status auto-sync after GRN
// //
// // RULE: Only touch "ordered" or "received" — never touch draft/cancelled
// // draft    → "ordered" : email middleware ne already kar diya
// // ordered  → "received": GRN fully accepted hone par (hum karte hain yahan)
// // cancelled→ kabhi nahi chhona
// // ─────────────────────────────────────────────────────────────────────────────
// async function syncPOStatus(poId: string): Promise<void> {
//   try {
//     const [po, grns] = await Promise.all([
//       PurchaseOrder.findById(poId).lean(),
//       GrnModel.find({ purchaseOrderId: poId }).lean(),
//     ]);

//     if (!po) return;

//     const currentStatus = (po as any).status;

//     // Only auto-update if PO is in "ordered" state
//     // "draft" already handled by email middleware
//     // "cancelled" never touch
//     if (!["ordered", "received"].includes(currentStatus)) {
//       console.log(`[StockService] ⏭️ PO "${currentStatus}" — skipping auto-update`);
//       return;
//     }

//     // Build ordered map: productId → total qty
//     const orderedMap: Record<string, number> = {};
//     for (const item of (po as any).items) {
//       const key = String(item.productId);
//       orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
//     }

//     // Build received map: productId → total accepted across ALL GRNs
//     const receivedMap: Record<string, number> = {};
//     for (const grn of grns) {
//       for (const item of (grn as any).items) {
//         const key = String(item.productId);
//         receivedMap[key] = (receivedMap[key] || 0) + (item.acceptedQuantity || 0);
//       }
//     }

//     const keys     = Object.keys(orderedMap);
//     const fullyMet = keys.every(k => (receivedMap[k] || 0) >= orderedMap[k]);

//     // partial → stays "ordered", fully done → "received"
//     const newStatus = fullyMet ? "received" : "ordered";

//     if (newStatus !== currentStatus) {
//       await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
//       console.log(`[StockService] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`);
//     } else {
//       console.log(`[StockService] ℹ️ PO status stays: "${currentStatus}" (partial receipt)`);
//     }

//   } catch (err: any) {
//     console.error("[StockService] ⚠️ syncPOStatus failed:", err.message);
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Discrepancy email to supplier
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
//       console.warn(`[StockService] ⚠️ No supplier email — discrepancy email skipped`);
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
//               Please arrange replacement or credit note for the affected units.
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

//     const text = `GRN Discrepancy Report — ${grn.grnNumber}\nPO: ${po.orderNumber}\n\nDear ${supplierName},\n\nTotal Rejected: ${totalRejected}\nTotal Damaged: ${totalDamaged}\n\nPlease arrange replacement or credit note. Ref: ${grn.grnNumber}`;

//     await emailService["sendMail"]({
//       from:    `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//       to:      supplierEmail,
//       subject: `⚠️ Discrepancy Report — ${grn.grnNumber} | ${totalRejected + totalDamaged} units affected`,
//       html,
//       text,
//     });

//     console.log(`[StockService] 📧 Discrepancy email → ${supplierEmail}`);
//   } catch (err: any) {
//     console.error("[StockService] ⚠️ Discrepancy email failed:", err.message);
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PUBLIC: Apply GRN to stock
// // ─────────────────────────────────────────────────────────────────────────────
// export async function applyGRNToStock(grnId: string): Promise<StockResult> {
//   try {
//     console.log("🚀 applyGRNToStock called for GRN:", grnId);
    
//     const grn = await GrnModel.findById(grnId).lean() as any;
//     if (!grn) throw new Error(`GRN not found: ${grnId}`);
    

//     // 1. Stock update (accepted qty only)
//     const deltas: StockDelta[] = grn.items
//       .filter((item: any) => (item.acceptedQuantity || 0) > 0)
//       .map((item: any) => ({
//         productId: String(item.productId),
//         sku:       item.sku,
//         delta:     item.acceptedQuantity,
//         reason:    `GRN ${grn.grnNumber}`,
//       }));

//     // 2. PO Status Update - Forcefully karo
    
//     const updateResult = await PurchaseOrder.findByIdAndUpdate(
//       grn.purchaseOrderId,
//       { 
//         status: "received",
//         receivedAt: new Date()
//       },
//       { new: true } // ← IMPORTANT: Updated document return karo
//     );
    
    

//     if (!updateResult) {
//       console.error("❌ PO not found with ID:", grn.purchaseOrderId);
//     }

//     // 3. Stock deltas apply karo
//     const result = deltas.length > 0
//       ? await applyStockDeltas(deltas)
//       : { success: true, updated: [], skipped: [], errors: [] };

//     // 4. Sync PO status (yeh already update kar chuke hain, isliye comment kar do)
//     // await syncPOStatus(String(grn.purchaseOrderId));

//     // 5. Discrepancy email
//     const hasDiscrepancy = grn.items.some(
//       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
//     );

//     if (hasDiscrepancy) {
//       const po = await PurchaseOrder.findById(grn.purchaseOrderId)
//         .populate("supplier", "contactInformation supplierIdentification")
//         .lean();
//       if (po) await sendGRNDiscrepancyEmail(grn, po);
//     }

//     console.log("✅ applyGRNToStock completed successfully");
//     return result;
    
//   } catch (err: any) {
//     console.error("❌ [StockService] applyGRNToStock failed:", err.message);
//     return { success: false, updated: [], skipped: [], errors: [err.message] };
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PUBLIC: Apply Goods Return to stock
// // ─────────────────────────────────────────────────────────────────────────────
// export async function applyReturnToStock(returnId: string): Promise<StockResult> {
//   try {
//     const goodsReturn = await GoodsReturn.findById(returnId).lean() as any;
//     if (!goodsReturn) throw new Error(`GoodsReturn not found: ${returnId}`);

//     const deltas: StockDelta[] = goodsReturn.items
//       .filter((item: any) => item.returnQty > 0 && item.productId && item.sku)
//       .map((item: any) => ({
//         productId: String(item.productId),
//         sku:       item.sku,
//         delta:     -item.returnQty,
//         reason:    `Return ${goodsReturn.grtnNumber}`,
//       }));

//     if (deltas.length === 0) {
//       console.warn(`[StockService] ⚠️ No traceable items in return ${goodsReturn.grtnNumber}`);
//       return { success: true, updated: [], skipped: [], errors: [] };
//     }

//     return await applyStockDeltas(deltas);
//   } catch (err: any) {
//     console.error("[StockService] applyReturnToStock failed:", err.message);
//     return { success: false, updated: [], skipped: [], errors: [err.message] };
//   }
// }


// services/stock.service.ts
// COMPLETE FIXED VERSION
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
// STEP 1: MongoDB mein stock update karo
// arrayFilters se sirf matching SKU ki qty change hoti hai
// ─────────────────────────────────────────────────────────────────────────────
async function applyStockDeltas(deltas: StockDelta[]): Promise<StockResult> {
  const result: StockResult = { success: true, updated: [], skipped: [], errors: [] };

  for (const { productId, sku, delta, reason } of deltas) {
    try {
      console.log(`[Stock] Updating sku=${sku}, delta=${delta > 0 ? "+" : ""}${delta}`);

      const res = await ProductModal.updateOne(
        { _id: productId, "attributes.sku": sku },
        { $inc: { "attributes.$[variant].stock.stockQuantity": delta } },
        { arrayFilters: [{ "variant.sku": sku }] }
      );

      console.log(`[Stock] matchedCount=${res.matchedCount} modifiedCount=${res.modifiedCount}`);

      if (res.matchedCount === 0) {
        // Product ya SKU nahi mila
        result.skipped.push(sku);
        console.warn(`[Stock] ⚠️ SKU not found in product | sku=${sku} productId=${productId}`);
      } else if (res.modifiedCount === 0) {
        // Match mila but update nahi hua — arrayFilter match nahi kiya
        result.skipped.push(sku);
        console.warn(`[Stock] ⚠️ Matched but not modified | sku=${sku} — check arrayFilter`);
      } else {
        result.updated.push(sku);
        console.log(`[Stock] ✅ ${reason} | sku=${sku} | ${delta > 0 ? "+" : ""}${delta}`);
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
// STEP 2: PO status auto-sync
//
// LOGIC:
//   Har GRN ke baad check karo — kya puri order aa gayi?
//   orderedQty vs acceptedQty compare karo (productId se)
//
//   fully received → PO "received"
//   partial        → PO "ordered" (unchanged)
//   cancelled      → KABHI MAT CHHO
// ─────────────────────────────────────────────────────────────────────────────
async function syncPOStatus(poId: string): Promise<void> {
  try {
    const [po, allGRNs] = await Promise.all([
      PurchaseOrder.findById(poId).lean(),
      GrnModel.find({ purchaseOrderId: poId }).lean(),
    ]);

    if (!po) {
      console.warn(`[Stock] ⚠️ PO not found: ${poId}`);
      return;
    }

    const currentStatus = (po as any).status;

    // Cancelled PO kabhi update mat karo
    if (currentStatus === "cancelled") {
      console.log(`[Stock] ⏭️ PO ${(po as any).orderNumber} is cancelled — skip`);
      return;
    }

    // PO mein kya order kiya tha — productId → qty
    const orderedMap: Record<string, number> = {};
    for (const item of (po as any).items ?? []) {
      const key = String(item.productId);
      orderedMap[key] = (orderedMap[key] || 0) + (item.quantity || 0);
    }

    // Saare GRNs mein se kitna accept hua — productId → acceptedQty
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

    let newStatus: string;
    if (fullyMet)     newStatus = "received";  // sab aa gaya
    else if (anyMet)  newStatus = "ordered";   // kuch aaya, baaki abhi bhi wait
    else              return;                  // kuch bhi nahi aaya — mat chho

    if (newStatus !== currentStatus) {
      await PurchaseOrder.updateOne({ _id: poId }, { $set: { status: newStatus } });
      console.log(`[Stock] 🔄 PO ${(po as any).orderNumber}: "${currentStatus}" → "${newStatus}"`);
    } else {
      console.log(`[Stock] ℹ️ PO ${(po as any).orderNumber} status unchanged: "${currentStatus}"`);
    }

  } catch (err: any) {
    console.error("[Stock] ⚠️ syncPOStatus failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Discrepancy email to supplier
// Sirf jab GRN mein rejected ya damaged items hon
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
              Please arrange replacement or credit note for the affected units.
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
    // Email fail hone se stock update BLOCK nahi hona chahiye
    console.error("[Stock] ⚠️ Discrepancy email failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: GRN se stock apply karo
// Flow: Stock update → PO status sync → Discrepancy email
// ─────────────────────────────────────────────────────────────────────────────
  // export async function applyGRNToStock(grnId: string): Promise<StockResult> {
  //   try {
  //     console.log(`[Stock] 🚀 applyGRNToStock START | grnId=${grnId}`);

  //     const grn = await GrnModel.findById(grnId).lean() as any;
  //     if (!grn) throw new Error(`GRN not found: ${grnId}`);

  //     console.log(`[Stock] GRN found: ${grn.grnNumber} | items: ${grn.items?.length}`);
  //     console.log(`[Stock] Items:`, grn.items?.map((i: any) => ({
  //       sku: i.sku, productId: i.productId, accepted: i.acceptedQuantity
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
  //       console.warn(`[Stock] ⚠️ No accepted items in GRN ${grn.grnNumber} — nothing to update`);
  //     }

  //     const result = deltas.length > 0
  //       ? await applyStockDeltas(deltas)
  //       : { success: true, updated: [], skipped: [], errors: [] };

  //     // ── STEP 2: PO status smart sync ─────────────────────────────────────
  //     // PARTIAL delivery → stays "ordered"
  //     // FULL delivery    → becomes "received"
  //     await syncPOStatus(String(grn.purchaseOrderId));

  //     // ── STEP 3: Discrepancy email (fire & forget — never block stock) ─────
  //     const hasDiscrepancy = (grn.items ?? []).some(
  //       (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
  //     );

  //     if (hasDiscrepancy) {
  //       const po = await PurchaseOrder
  //         .findById(grn.purchaseOrderId)
  //         .populate("supplier", "contactInformation supplierIdentification")
  //         .lean();
  //       if (po) {
  //         sendGRNDiscrepancyEmail(grn, po).catch(err =>
  //           console.error("[Stock] Discrepancy email error:", err.message)
  //         );
  //       }
  //     }

  //     console.log(`[Stock] ✅ applyGRNToStock DONE | updated=${result.updated} skipped=${result.skipped}`);
  //     return result;

  //   } catch (err: any) {
  //     console.error(`[Stock] ❌ applyGRNToStock FAILED:`, err.message);
  //     return { success: false, updated: [], skipped: [], errors: [err.message] };
  //   }
  // }


  export async function applyGRNToStock(grnId: string): Promise<StockResult> {
  try {
    console.log(`[Stock] 🚀 applyGRNToStock START | grnId=${grnId}`);

    const grn = await GrnModel.findById(grnId).lean() as any;
    if (!grn) throw new Error(`GRN not found: ${grnId}`);

    console.log(`[Stock] GRN found: ${grn.grnNumber} | items: ${grn.items?.length}`);
    console.log(`[Stock] Items:`, grn.items?.map((i: any) => ({
      sku: i.sku, productId: i.productId, accepted: i.acceptedQuantity
    })));

    // ── STEP 1: Stock update ─────────────────────────────── UNCHANGED ────
    const deltas: StockDelta[] = (grn.items ?? [])
      .filter((item: any) => (item.acceptedQuantity || 0) > 0)
      .map((item: any) => ({
        productId: String(item.productId),
        sku:       item.sku,
        delta:     item.acceptedQuantity,
        reason:    `GRN ${grn.grnNumber}`,
      }));

    if (deltas.length === 0) {
      console.warn(`[Stock] ⚠️ No accepted items in GRN ${grn.grnNumber} — nothing to update`);
    }

    const result = deltas.length > 0
      ? await applyStockDeltas(deltas)
      : { success: true, updated: [], skipped: [], errors: [] };

    // ── STEP 2: PO status smart sync ─────────────────────── UNCHANGED ───
    await syncPOStatus(String(grn.purchaseOrderId));

    // ── STEP 3: Discrepancy email ─────────────────────────── UNCHANGED ──
    const hasDiscrepancy = (grn.items ?? []).some(
      (item: any) => (item.rejectedQuantity || 0) > 0 || (item.damageQuantity || 0) > 0
    );

    if (hasDiscrepancy) {
      const po = await PurchaseOrder
        .findById(grn.purchaseOrderId)
        .populate("supplier", "contactInformation supplierIdentification")
        .lean();
      if (po) {
        sendGRNDiscrepancyEmail(grn, po).catch(err =>
          console.error("[Stock] Discrepancy email error:", err.message)
        );
      }
    }

    // ── STEP 4: ✅ NEW — Ledger DEBIT ─────────────────────────────────────
    // GRN receive hua → hum supplier ke outstanding badha → DEBIT
    // try/catch ensures ledger failure never blocks stock update
    try {
      const po = await PurchaseOrder
        .findById(grn.purchaseOrderId)
        .select("supplier")
        .lean() as any;

      const supplierId = po?.supplier;

      const totalAmount =
        grn.totalAmount ||
        (grn.items ?? []).reduce((sum: number, item: any) =>
          sum + (item.acceptedQuantity || 0) * (item.unitPrice || 0), 0
        );

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

        console.log(
          `[Stock] 💰 Ledger DEBIT | GRN: ${grn.grnNumber} | £${totalAmount} | Supplier: ${supplierId}`
        );
      } else {
        console.warn(
          `[Stock] ⚠️ Ledger DEBIT skipped — supplierId: ${supplierId}, totalAmount: ${totalAmount}`
        );
      }
    } catch (ledgerErr: any) {
      console.error(`[Stock] ❌ Ledger DEBIT failed for ${grn.grnNumber}:`, ledgerErr.message);
    }
    // ── END STEP 4 ────────────────────────────────────────────────────────

    console.log(`[Stock] ✅ applyGRNToStock DONE | updated=${result.updated} skipped=${result.skipped}`);
    return result;

  } catch (err: any) {
    console.error(`[Stock] ❌ applyGRNToStock FAILED:`, err.message);
    return { success: false, updated: [], skipped: [], errors: [err.message] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Goods Return se stock kam karo
// Sirf "completed" status pe call hota hai (controller se)
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
        delta:     -item.returnQty,  // negative = stock kam hogi
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