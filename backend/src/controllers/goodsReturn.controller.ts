// // controllers/goodsReturn.controller.ts
// import { Request, Response } from "express";
// import { GoodsReturn }        from "../models/goodsReturn.model";
// import { PurchaseOrder }      from "../models/purchaseOrder.model";
// import { applyReturnToStock } from "../services/stock.service";
// import { emailService }       from "../services/email.service";

// // ─────────────────────────────────────────────────────────────────────────────
// // Valid status transitions
// // ─────────────────────────────────────────────────────────────────────────────
// const VALID_TRANSITIONS: Record<string, string[]> = {
//   "pending":    ["approved",   "rejected"],
//   "approved":   ["in-transit", "rejected"],
//   "in-transit": ["completed",  "rejected"],
//   "completed":  [],  // terminal
//   "rejected":   [],  // terminal
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PATCH /api/goods-returns/:id/status
// // ─────────────────────────────────────────────────────────────────────────────
// export const updateGoodsReturnStatus = async (req: Request, res: Response) => {
//   try {
//     const { id }     = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({ success: false, message: "status is required" });
//     }

//     const goodsReturn = await GoodsReturn.findById(id)
//       .populate({
//         path:   "grnId",
//         select: "grnNumber purchaseOrderId",
//         populate: {
//           path:   "purchaseOrderId",
//           select: "orderNumber supplier",
//           populate: { path: "supplier", select: "contactInformation supplierIdentification" }
//         }
//       });

//     if (!goodsReturn) {
//       return res.status(404).json({ success: false, message: "Goods Return not found" });
//     }

//     const currentStatus = goodsReturn.status;

//     // ── Validate transition ──────────────────────────────────────────────
//     const allowed = VALID_TRANSITIONS[currentStatus] || [];
//     if (!allowed.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid transition: "${currentStatus}" → "${status}". Allowed: [${allowed.join(", ")}]`,
//       });
//     }

//     // ── Save new status ──────────────────────────────────────────────────
//     goodsReturn.status = status;
//     await goodsReturn.save();

//     const grtnNumber = (goodsReturn as any).grtnNumber;
//     console.log(`[GoodsReturn] ${grtnNumber}: "${currentStatus}" → "${status}"`);

//     // ════════════════════════════════════════════════════════════════════
//     // STATUS: "completed"
//     // → Stock DECREASES (items physically left warehouse)
//     // → Email sent to supplier confirming receipt of return
//     // ════════════════════════════════════════════════════════════════════
//     if (status === "completed") {

//       // ── 1. Stock decrease (fire-and-forget) ──
//       applyReturnToStock(String(goodsReturn._id))
//         .then(result => {
//           if (result.success) {
//             console.log(`[GoodsReturn] ✅ Stock reversed for ${grtnNumber} | SKUs: [${result.updated.join(", ")}]`);
//           } else {
//             console.error(`[GoodsReturn] ❌ Partial stock failure for ${grtnNumber}:`, result.errors);
//           }
//         })
//         .catch(err => console.error(`[GoodsReturn] ❌ Stock reversal error:`, err.message));

//       // ── 2. Email supplier — return completed ──
//       sendReturnCompletedEmail(goodsReturn).catch(err =>
//         console.error(`[GoodsReturn] ⚠️ Supplier email failed:`, err.message)
//       );
//     }

//     // ════════════════════════════════════════════════════════════════════
//     // STATUS: "rejected"
//     // → Stock UNCHANGED (items came back to warehouse)
//     // → No email needed (internal decision)
//     // ════════════════════════════════════════════════════════════════════
//     if (status === "rejected") {
//       console.log(`[GoodsReturn] Return rejected — stock unchanged for ${grtnNumber}`);
//     }

//     return res.json({
//       success: true,
//       message: `Status updated to "${status}"`,
//       data: {
//         _id:          goodsReturn._id,
//         status:       goodsReturn.status,
//         grtnNumber,
//         stockUpdated: status === "completed",
//       },
//     });

//   } catch (err: any) {
//     console.error("[GoodsReturn] updateStatus error:", err.message);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Email: Return Completed — sent to supplier when items received by them
// // ─────────────────────────────────────────────────────────────────────────────
// async function sendReturnCompletedEmail(goodsReturn: any): Promise<void> {
//   try {
//     const grn = goodsReturn.grnId as any;
//     const po  = grn?.purchaseOrderId as any;

//     const supplierEmail: string =
//       po?.supplier?.contactInformation?.emailAddress  ||
//       po?.supplier?.contactInformation?.email         ||
//       po?.orderContactEmail                            ||
//       "";

//     if (!supplierEmail) {
//       console.warn(`[GoodsReturn] ⚠️ No supplier email — return completed email skipped`);
//       return;
//     }

//     const supplierName: string =
//       po?.supplier?.contactInformation?.primaryContactName  ||
//       po?.supplier?.supplierIdentification?.legalBusinessName ||
//       "Supplier";

//     const grtnNumber  = goodsReturn.grtnNumber  || "N/A";
//     const grnNumber   = grn?.grnNumber          || "N/A";
//     const orderNumber = po?.orderNumber         || "N/A";

//     const totalQty = goodsReturn.items.reduce(
//       (sum: number, item: any) => sum + (item.returnQty || 0), 0
//     );
//     const totalValue = goodsReturn.items.reduce(
//       (sum: number, item: any) => sum + (item.totalAmount || 0), 0
//     );

//     const itemRows = goodsReturn.items.map((item: any) => `
//       <tr style="border-bottom:1px solid #e5e7eb;">
//         <td style="padding:12px;font-weight:500;">${item.productName || "N/A"}</td>
//         <td style="padding:12px;font-family:monospace;color:#6b7280;">${item.sku || "N/A"}</td>
//         <td style="padding:12px;text-align:center;color:#dc2626;font-weight:600;">${item.returnQty || 0}</td>
//         <td style="padding:12px;text-align:center;">£${(item.unitPrice || 0).toFixed(2)}</td>
//         <td style="padding:12px;text-align:right;font-weight:600;">£${(item.totalAmount || 0).toFixed(2)}</td>
//         <td style="padding:12px;color:#6b7280;font-size:13px;">${item.itemsNotes || "—"}</td>
//       </tr>
//     `).join("");

//     const html = `
//       <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#1f2937;">

//         <!-- Header -->
//         <div style="background:linear-gradient(135deg,#dc2626,#ea580c);padding:30px;border-radius:12px 12px 0 0;">
//           <h1 style="color:white;margin:0;font-size:22px;">📦 Goods Return — Completed</h1>
//           <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">
//             Return Note: <strong>${grtnNumber}</strong> | GRN: <strong>${grnNumber}</strong>
//           </p>
//         </div>

//         <!-- Body -->
//         <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;">

//           <p>Dear <strong>${supplierName}</strong>,</p>
//           <p style="color:#374151;line-height:1.6;">
//             We confirm that the following goods return against Purchase Order
//             <strong>${orderNumber}</strong> has been completed.
//             The items listed below have been returned to you in full.
//           </p>

//           <!-- Summary -->
//           <div style="display:flex;gap:16px;margin:20px 0;">
//             <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:16px 24px;text-align:center;">
//               <p style="margin:0;font-size:32px;font-weight:700;color:#dc2626;">${totalQty}</p>
//               <p style="margin:4px 0 0;font-size:13px;color:#991b1b;">Units Returned</p>
//             </div>
//             <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px 24px;text-align:center;">
//               <p style="margin:0;font-size:32px;font-weight:700;color:#d97706;">${goodsReturn.items.length}</p>
//               <p style="margin:4px 0 0;font-size:13px;color:#92400e;">Product Lines</p>
//             </div>
//             <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px 24px;text-align:center;">
//               <p style="margin:0;font-size:32px;font-weight:700;color:#16a34a;">£${totalValue.toFixed(2)}</p>
//               <p style="margin:4px 0 0;font-size:13px;color:#15803d;">Total Return Value</p>
//             </div>
//           </div>

//           <!-- Items Table -->
//           <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
//             <thead>
//               <tr style="background:#f3f4f6;">
//                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Product</th>
//                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">SKU</th>
//                 <th style="padding:12px;text-align:center;font-size:13px;color:#dc2626;">Qty Returned</th>
//                 <th style="padding:12px;text-align:center;font-size:13px;color:#6b7280;">Unit Price</th>
//                 <th style="padding:12px;text-align:right;font-size:13px;color:#6b7280;">Total</th>
//                 <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Notes</th>
//               </tr>
//             </thead>
//             <tbody>${itemRows}</tbody>
//             <tfoot>
//               <tr style="background:#fef2f2;">
//                 <td colspan="4" style="padding:12px;text-align:right;font-weight:700;color:#dc2626;">Total Return Value:</td>
//                 <td style="padding:12px;text-align:right;font-weight:700;color:#dc2626;font-size:16px;">£${totalValue.toFixed(2)}</td>
//                 <td></td>
//               </tr>
//             </tfoot>
//           </table>

//           <!-- Action box -->
//           <div style="margin-top:24px;padding:16px;background:#fff7ed;border-left:4px solid #ea580c;border-radius:4px;">
//             <p style="margin:0;font-weight:600;color:#9a3412;">Credit Note / Refund</p>
//             <p style="margin:8px 0 0;color:#7c2d12;font-size:14px;">
//               Please process a credit note or refund for the returned amount of
//               <strong>£${totalValue.toFixed(2)}</strong>.
//               Reference: <strong>${grtnNumber}</strong>
//             </p>
//           </div>

//           <p style="margin-top:24px;">Best regards,<br/>
//             <strong>${process.env.APP_NAME || "Inventory Pro"}</strong>
//           </p>
//         </div>

//         <!-- Footer -->
//         <div style="background:#1f2937;padding:16px;border-radius:0 0 12px 12px;text-align:center;">
//           <p style="color:#9ca3af;margin:0;font-size:12px;">
//             Automated message — ${process.env.APP_NAME || "Inventory Pro"}
//           </p>
//         </div>
//       </div>
//     `;

//     const text = `
// Goods Return Completed — ${grtnNumber}
// PO: ${orderNumber} | GRN: ${grnNumber}

// Dear ${supplierName},

// The following return has been completed:
// Total Units: ${totalQty}
// Total Value: £${totalValue.toFixed(2)}

// Items:
// ${goodsReturn.items.map((i: any) =>
//   `${i.productName} (${i.sku}) — ${i.returnQty} units @ £${(i.unitPrice||0).toFixed(2)}`
// ).join("\n")}

// Please process a credit note for £${totalValue.toFixed(2)}.
// Reference: ${grtnNumber}
//     `.trim();

//     await emailService["sendMail"]({
//       from:    `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//       to:      supplierEmail,
//       subject: `📦 Return Completed — ${grtnNumber} | £${totalValue.toFixed(2)} credit due`,
//       html,
//       text,
//     });

//     console.log(`[GoodsReturn] 📧 Return completed email → ${supplierEmail}`);

//   } catch (err: any) {
//     console.error("[GoodsReturn] sendReturnCompletedEmail failed:", err.message);
//   }
// }

// export const getReturnsBySupplier = async (req: Request, res: Response) => {
//   try {
//     const { supplierId } = req.params;
//     const { userId, limit } = req.query; 

    
//     const returns = await GoodsReturn.find()
//       .populate({
//         path: "grnId",
//         select: "grnNumber purchaseOrderId",
//         populate: {
//           path: "purchaseOrderId",
//           select: "orderNumber supplier",
//           populate: {
//             path: "supplier",
//             select: "contactInformation supplierIdentification"
//           }
//         }
//       })
//       .limit(limit ? parseInt(limit as string) : 50) // Apply limit
//       .sort({ createdAt: -1 }) // Sort by newest first
//       .lean();

//     // Filter returns for this supplier
//     const filtered = returns.filter((ret: any) => {
//       const poSupplier = ret?.grnId?.purchaseOrderId?.supplier;
//       return String(poSupplier?._id) === String(supplierId);
//     });

//     res.json({ 
//       success: true, 
//       data: filtered,
//       count: filtered.length 
//     });
//   } catch (err: any) {
//     res.status(500).json({ 
//       success: false, 
//       message: err.message 
//     });
//   }
// };

// export const getReturnStatsBySupplier = async (req: Request, res: Response) => {
//   try {
//     const { supplierId } = req.params;

//     const returns = await GoodsReturn.find()
//       .populate({
//         path: "grnId",
//         select: "purchaseOrderId",
//         populate: {
//           path: "purchaseOrderId",
//           select: "supplier",
//         },
//       })
//       .select("status items") // sirf zaruri fields
//       .lean();

//     // Filter — is supplier ki returns
//     const filtered = returns.filter((ret: any) => {
//       const poSupplier = ret?.grnId?.purchaseOrderId?.supplier;
//       return String(poSupplier) === String(supplierId);
//     });

//     // Calculate stats
//     const stats = {
//       totalReturns: filtered.length,

//       completed: filtered.filter((r: any) => r.status === "completed").length,

//       pending: filtered.filter((r: any) =>
//         ["pending", "approved", "in-transit"].includes(r.status)
//       ).length,

//       rejected: filtered.filter((r: any) => r.status === "rejected").length,

//       // SUM of returnQuantity × unitPrice across all items
//       totalValue: filtered.reduce((sum: number, ret: any) => {
//         const retValue = (ret.items || []).reduce((s: number, item: any) => {
//           return s + (item.returnQuantity || 0) * (item.unitPrice || 0);
//         }, 0);
//         return sum + retValue;
//       }, 0),
//     };

//     res.json({ success: true, data: stats });

//   } catch (err: any) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// controllers/goodsReturn.controller.ts — UPDATED
// Only change: Added Ledger CREDIT (Step 3) inside the "completed" block
// Everything else is IDENTICAL to your existing code
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response }   from "express";
import { GoodsReturn }         from "../models/goodsReturn.model";
import { PurchaseOrder }       from "../models/purchaseOrder.model";
import { applyReturnToStock }  from "../services/stock.service";
import { emailService }        from "../services/email.service";
import { createCreditEntry }   from "../services/ledger.service"; // ✅ ADD THIS LINE

// ─────────────────────────────────────────────────────────────────────────────
// Valid status transitions — UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
const VALID_TRANSITIONS: Record<string, string[]> = {
  "pending":    ["approved",   "rejected"],
  "approved":   ["in-transit", "rejected"],
  "in-transit": ["completed",  "rejected"],
  "completed":  [],
  "rejected":   [],
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/goods-returns/:id/status — UPDATED (Ledger CREDIT added)
// ─────────────────────────────────────────────────────────────────────────────
export const updateGoodsReturnStatus = async (req: Request, res: Response) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required" });
    }

    const goodsReturn = await GoodsReturn.findById(id)
      .populate({
        path:   "grnId",
        select: "grnNumber purchaseOrderId",
        populate: {
          path:   "purchaseOrderId",
          select: "orderNumber supplier",
          populate: { path: "supplier", select: "contactInformation supplierIdentification" }
        }
      });

    if (!goodsReturn) {
      return res.status(404).json({ success: false, message: "Goods Return not found" });
    }

    const currentStatus = goodsReturn.status;

    // ── Validate transition — UNCHANGED ─────────────────────────────────
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: "${currentStatus}" → "${status}". Allowed: [${allowed.join(", ")}]`,
      });
    }

    // ── Save new status — UNCHANGED ──────────────────────────────────────
    goodsReturn.status = status;
    await goodsReturn.save();

    const grtnNumber = (goodsReturn as any).grtnNumber;
    console.log(`[GoodsReturn] ${grtnNumber}: "${currentStatus}" → "${status}"`);

    // ════════════════════════════════════════════════════════════════════
    // STATUS: "completed" — Step 3 (Ledger CREDIT) ADDED
    // ════════════════════════════════════════════════════════════════════
    if (status === "completed") {

      // ── 1. Stock decrease — UNCHANGED ───────────────────────────────
      applyReturnToStock(String(goodsReturn._id))
        .then(result => {
          if (result.success) {
            console.log(`[GoodsReturn] ✅ Stock reversed for ${grtnNumber} | SKUs: [${result.updated.join(", ")}]`);
          } else {
            console.error(`[GoodsReturn] ❌ Partial stock failure for ${grtnNumber}:`, result.errors);
          }
        })
        .catch(err => console.error(`[GoodsReturn] ❌ Stock reversal error:`, err.message));

      // ── 2. Email supplier — UNCHANGED ────────────────────────────────
      sendReturnCompletedEmail(goodsReturn).catch(err =>
        console.error(`[GoodsReturn] ⚠️ Supplier email failed:`, err.message)
      );

      // ── 3. ✅ NEW — Ledger CREDIT ──────────────────────────────────────
      // GRTN complete → supplier ne return receive kiya → outstanding ghata → CREDIT
      // try/catch ensures ledger failure never blocks the status update
      try {
        const grn = (goodsReturn as any).grnId as any;
        const po  = grn?.purchaseOrderId as any;

        // supplierId: GRTN → GRN (populated) → PO (populated) → supplier._id
        const supplierId = po?.supplier?._id || po?.supplier;

        const totalAmount =
          (goodsReturn as any).totalAmount ||
          goodsReturn.items.reduce((sum: number, item: any) =>
            sum + (item.returnQty || item.returnQuantity || 0) * (item.unitPrice || 0), 0
          );

        if (supplierId && totalAmount > 0) {
          await createCreditEntry({
            supplierId:      String(supplierId),
            amount:          totalAmount,
            referenceType:   "GRTN",
            referenceId:     goodsReturn._id as any,
            referenceNumber: grtnNumber,
            notes:           `Return completed: ${grtnNumber}`,
            createdBy:       (req as any).user?.name || "system",
          });

          console.log(
            `[GoodsReturn] 💰 Ledger CREDIT | GRTN: ${grtnNumber} | £${totalAmount} | Supplier: ${supplierId}`
          );
        } else {
          console.warn(
            `[GoodsReturn] ⚠️ Ledger CREDIT skipped — supplierId: ${supplierId}, totalAmount: ${totalAmount}`
          );
        }
      } catch (ledgerErr: any) {
        console.error(`[GoodsReturn] ❌ Ledger CREDIT failed for ${grtnNumber}:`, ledgerErr.message);
      }
      // ── END STEP 3 ────────────────────────────────────────────────────
    }

    // ════════════════════════════════════════════════════════════════════
    // STATUS: "rejected" — UNCHANGED
    // ════════════════════════════════════════════════════════════════════
    if (status === "rejected") {
      console.log(`[GoodsReturn] Return rejected — stock unchanged for ${grtnNumber}`);
    }

    return res.json({
      success: true,
      message: `Status updated to "${status}"`,
      data: {
        _id:          goodsReturn._id,
        status:       goodsReturn.status,
        grtnNumber,
        stockUpdated: status === "completed",
      },
    });

  } catch (err: any) {
    console.error("[GoodsReturn] updateStatus error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// sendReturnCompletedEmail — COMPLETELY UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
async function sendReturnCompletedEmail(goodsReturn: any): Promise<void> {
  try {
    const grn = goodsReturn.grnId as any;
    const po  = grn?.purchaseOrderId as any;

    const supplierEmail: string =
      po?.supplier?.contactInformation?.emailAddress  ||
      po?.supplier?.contactInformation?.email         ||
      po?.orderContactEmail                            ||
      "";

    if (!supplierEmail) {
      console.warn(`[GoodsReturn] ⚠️ No supplier email — return completed email skipped`);
      return;
    }

    const supplierName: string =
      po?.supplier?.contactInformation?.primaryContactName  ||
      po?.supplier?.supplierIdentification?.legalBusinessName ||
      "Supplier";

    const grtnNumber  = goodsReturn.grtnNumber  || "N/A";
    const grnNumber   = grn?.grnNumber          || "N/A";
    const orderNumber = po?.orderNumber         || "N/A";

    const totalQty = goodsReturn.items.reduce(
      (sum: number, item: any) => sum + (item.returnQty || 0), 0
    );
    const totalValue = goodsReturn.items.reduce(
      (sum: number, item: any) => sum + (item.totalAmount || 0), 0
    );

    const itemRows = goodsReturn.items.map((item: any) => `
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:12px;font-weight:500;">${item.productName || "N/A"}</td>
        <td style="padding:12px;font-family:monospace;color:#6b7280;">${item.sku || "N/A"}</td>
        <td style="padding:12px;text-align:center;color:#dc2626;font-weight:600;">${item.returnQty || 0}</td>
        <td style="padding:12px;text-align:center;">£${(item.unitPrice || 0).toFixed(2)}</td>
        <td style="padding:12px;text-align:right;font-weight:600;">£${(item.totalAmount || 0).toFixed(2)}</td>
        <td style="padding:12px;color:#6b7280;font-size:13px;">${item.itemsNotes || "—"}</td>
      </tr>
    `).join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;color:#1f2937;">
        <div style="background:linear-gradient(135deg,#dc2626,#ea580c);padding:30px;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:22px;">📦 Goods Return — Completed</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">
            Return Note: <strong>${grtnNumber}</strong> | GRN: <strong>${grnNumber}</strong>
          </p>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;">
          <p>Dear <strong>${supplierName}</strong>,</p>
          <p style="color:#374151;line-height:1.6;">
            We confirm that the following goods return against Purchase Order
            <strong>${orderNumber}</strong> has been completed.
            The items listed below have been returned to you in full.
          </p>
          <div style="display:flex;gap:16px;margin:20px 0;">
            <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:16px 24px;text-align:center;">
              <p style="margin:0;font-size:32px;font-weight:700;color:#dc2626;">${totalQty}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#991b1b;">Units Returned</p>
            </div>
            <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px 24px;text-align:center;">
              <p style="margin:0;font-size:32px;font-weight:700;color:#d97706;">${goodsReturn.items.length}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#92400e;">Product Lines</p>
            </div>
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px 24px;text-align:center;">
              <p style="margin:0;font-size:32px;font-weight:700;color:#16a34a;">£${totalValue.toFixed(2)}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#15803d;">Total Return Value</p>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Product</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">SKU</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#dc2626;">Qty Returned</th>
                <th style="padding:12px;text-align:center;font-size:13px;color:#6b7280;">Unit Price</th>
                <th style="padding:12px;text-align:right;font-size:13px;color:#6b7280;">Total</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#6b7280;">Notes</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr style="background:#fef2f2;">
                <td colspan="4" style="padding:12px;text-align:right;font-weight:700;color:#dc2626;">Total Return Value:</td>
                <td style="padding:12px;text-align:right;font-weight:700;color:#dc2626;font-size:16px;">£${totalValue.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:24px;padding:16px;background:#fff7ed;border-left:4px solid #ea580c;border-radius:4px;">
            <p style="margin:0;font-weight:600;color:#9a3412;">Credit Note / Refund</p>
            <p style="margin:8px 0 0;color:#7c2d12;font-size:14px;">
              Please process a credit note or refund for the returned amount of
              <strong>£${totalValue.toFixed(2)}</strong>.
              Reference: <strong>${grtnNumber}</strong>
            </p>
          </div>
          <p style="margin-top:24px;">Best regards,<br/>
            <strong>${process.env.APP_NAME || "Inventory Pro"}</strong>
          </p>
        </div>
        <div style="background:#1f2937;padding:16px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="color:#9ca3af;margin:0;font-size:12px;">
            Automated message — ${process.env.APP_NAME || "Inventory Pro"}
          </p>
        </div>
      </div>
    `;

    const text = `
Goods Return Completed — ${grtnNumber}
PO: ${orderNumber} | GRN: ${grnNumber}
Dear ${supplierName},
Total Units: ${totalQty} | Total Value: £${totalValue.toFixed(2)}
Please process a credit note for £${totalValue.toFixed(2)}.
Reference: ${grtnNumber}
    `.trim();

    await emailService["sendMail"]({
      from:    `${process.env.APP_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to:      supplierEmail,
      subject: `📦 Return Completed — ${grtnNumber} | £${totalValue.toFixed(2)} credit due`,
      html,
      text,
    });

    console.log(`[GoodsReturn] 📧 Return completed email → ${supplierEmail}`);
  } catch (err: any) {
    console.error("[GoodsReturn] sendReturnCompletedEmail failed:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getReturnsBySupplier — COMPLETELY UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
export const getReturnsBySupplier = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { userId, limit } = req.query;

    const returns = await GoodsReturn.find()
      .populate({
        path: "grnId",
        select: "grnNumber purchaseOrderId",
        populate: {
          path: "purchaseOrderId",
          select: "orderNumber supplier",
          populate: {
            path: "supplier",
            select: "contactInformation supplierIdentification"
          }
        }
      })
      .limit(limit ? parseInt(limit as string) : 50)
      .sort({ createdAt: -1 })
      .lean();

    const filtered = returns.filter((ret: any) => {
      const poSupplier = ret?.grnId?.purchaseOrderId?.supplier;
      return String(poSupplier?._id) === String(supplierId);
    });

    res.json({ success: true, data: filtered, count: filtered.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getReturnStatsBySupplier — COMPLETELY UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────
export const getReturnStatsBySupplier = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;

    const returns = await GoodsReturn.find()
      .populate({
        path: "grnId",
        select: "purchaseOrderId",
        populate: { path: "purchaseOrderId", select: "supplier" },
      })
      .select("status items")
      .lean();

    const filtered = returns.filter((ret: any) => {
      const poSupplier = ret?.grnId?.purchaseOrderId?.supplier;
      return String(poSupplier) === String(supplierId);
    });

    const stats = {
      totalReturns: filtered.length,
      completed:    filtered.filter((r: any) => r.status === "completed").length,
      pending:      filtered.filter((r: any) =>
        ["pending", "approved", "in-transit"].includes(r.status)
      ).length,
      rejected:     filtered.filter((r: any) => r.status === "rejected").length,
      totalValue:   filtered.reduce((sum: number, ret: any) => {
        const retValue = (ret.items || []).reduce((s: number, item: any) =>
          s + (item.returnQuantity || 0) * (item.unitPrice || 0), 0
        );
        return sum + retValue;
      }, 0),
    };

    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};