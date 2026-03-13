// middlewares/purchaseOrderEmail.middleware.ts
import { Request, Response, NextFunction } from "express";
import { emailService } from "../services/email.service";
import { POEmailData, POEmailItem } from "../types/email/email.types";
import { PurchaseOrder } from "../models/purchaseOrder.model"; 

export const interceptAndSendPOEmail = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
        // ── 1. Send HTTP response immediately — never block the client ──
        const result = originalJson(body);

        // ── 2. Only fire on a successful create (2xx) ──
        if (res.statusCode >= 200 && res.statusCode < 300 && body) {
            const po = body?.data ?? body;

            if (!po?.orderNumber || !po?._id) {
                return result;
            }

            // ── 3. Async IIFE — populate then send email ──
            (async () => {
                try {
                    // Re-fetch the saved document with supplier + productId populated
                    const populated = await PurchaseOrder.findById(po._id)
                        .populate<{ supplier: { name: string; email: string } }>(
                            "supplier",
                            "name email"          // ← only fetch what we need
                        )
                        .populate(
                            "items.productId",
                            "productName sku"     // ← adjust field names to your Product model
                        )
                        .lean();

                    if (!populated) {
                        console.warn(`[POEmailMiddleware] ⚠️ PO not found after create: ${po._id}`);
                        return;
                    }

                    // ── 4. Extract supplier fields (now fully populated) ──
                    const supplierName:  string = populated.supplier?.name  ?? "Supplier";
                    const supplierEmail: string = populated.supplier?.email
                        ?? populated.orderContactEmail
                        ?? req.body?.orderContactEmail
                        ?? "";

                    if (!supplierEmail) {
                        console.warn(`[POEmailMiddleware] ⚠️ No supplier email for PO ${populated.orderNumber} — skipping.`);
                        return;
                    }

                    // ── 5. Map items — productId is now a populated object ──
                    const items: POEmailItem[] = (populated.items ?? []).map((item: any) => {
                        const product = item.productId;  // populated object
                        return {
                            productName: product?.productName ?? item.productName ?? "Product",
                            sku:         product?.sku         ?? item.sku         ?? "N/A",
                            quantity:    Number(item.quantity)  || 0,
                            unitPrice:   Number(item.unitPrice) || 0,
                            totalPrice:  (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
                        };
                    });

                    // ── 6. Build POEmailData ──
                    const poEmailData: POEmailData = {
                        poNumber:         populated.orderNumber,
                        supplierName,
                        supplierEmail,
                        buyerCompany:     process.env.APP_NAME        ?? "Humber",
                        buyerEmail:       process.env.SMTP_FROM_EMAIL ?? "",
                        items,
                        subtotal:         Number(populated.subtotal) || 0,
                        vatAmount:        Number(populated.tax)      || 0,
                        total:            Number(populated.total)    || 0,
                        orderDate:        populated.orderDate
                                            ? new Date(populated.orderDate)
                                            : new Date(),
                        expectedDelivery: populated.expectedDelivery
                                            ? new Date(populated.expectedDelivery)
                                            : undefined,
                        notes:            populated.notes,
                        
                    };

                    // ── 7. Send ──
                    await emailService.sendPurchaseOrderToSupplier(poEmailData);
                    console.log(`[POEmailMiddleware] ✅ Email sent for PO: ${populated.orderNumber} → ${supplierEmail}`);

                } catch (err: any) {
                    console.error(`[POEmailMiddleware] ❌ Email failed for PO ${po.orderNumber}:`, err.message);
                }
            })();
        }

        return result;
    };

    next();
};