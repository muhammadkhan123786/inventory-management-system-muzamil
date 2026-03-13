// import { Request, Response } from "express";
// import { PurchaseOrder } from "../models/purchaseOrder.model";
// import { emailService } from "../services/email.service"; // Correct import

// // ─────────────────────────────────────────────────────────────────────────────
// // Valid manual transitions
// //
// //  draft    → cancelled  (manual — email to supplier)
// //  ordered  → cancelled  (manual — email to supplier)
// //  received → []         terminal (AUTO by GRN)
// //  cancelled→ []         terminal
// //
// // ─────────────────────────────────────────────────────────────────────────────
// const VALID_TRANSITIONS: Record<string, string[]> = {
//   draft:     ["cancelled"],
//   ordered:   ["cancelled"],
//   received:  [],
//   cancelled: [],
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PATCH /api/purchase-orders/:id/status
// // ─────────────────────────────────────────────────────────────────────────────
// export const updatePurchaseOrderStatus = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const { id }     = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({
//         success: false,
//         message: "Status is required",
//       });
//     }

//     // ── Fetch PO with supplier populated ─────────────────────────────────────
//     const po = await PurchaseOrder.findById(id)
//       .populate("supplier")
//       .lean() as any;

//     if (!po) {
//       return res.status(404).json({
//         success: false,
//         message: "Purchase Order not found",
//       });
//     }

//     const currentStatus = po.status;

//     // ── Validate transition ───────────────────────────────────────────────────
//     const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
//     if (!allowed.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid transition: "${currentStatus}" → "${status}". Allowed: [${allowed.join(", ")}]`,
//       });
//     }

//     // ── Update DB ─────────────────────────────────────────────────────────────
//     await PurchaseOrder.updateOne({ _id: id }, { $set: { status } });

//     console.log(`[PO] ${po.orderNumber}: "${currentStatus}" → "${status}"`);

//     // ── Cancellation email → supplier (fire-and-forget) ───────────────────────
//     if (status === "cancelled") {
//       emailService.sendCancellationEmail(po).catch((err) =>
//         console.error("[PO] ⚠️ Cancellation email failed:", err.message),
//       );
//     }

//     return res.json({
//       success: true,
//       message: `Status updated to "${status}"`,
//       data: {
//         _id:         po._id,
//         orderNumber: po.orderNumber,
//         status,
//       },
//     });

//   } catch (err: any) {
//     console.error("[PO] updateStatus error:", err.message);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// ─────────────────────────────────────────────────────────────────────────────
// FIXES IN THIS VERSION:
//
//  BUG: When PO status → "received", product stockQuantity was NEVER updated.
//  Marking a PO received only cleared stock alerts, but the actual
//  product.attributes[n].stock.stockQuantity field stayed at its old low value.
//  Next reorder scan would find the same product again because stock hadn't moved.
//
//  FIX: Added stock increment block in updateStatus() using MongoDB's
//  $inc + arrayFilters for atomic, targeted updates — no full document reload.
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response } from "express";
import { PurchaseOrder } from "../models/purchaseOrder.model";
import { Types } from "mongoose";
import { SupplierModel } from "../models/suppliers/supplier.models";
import { generatePdfFromTemplate } from "../utils/pdfGenerator";
import { generateBulkPONumbers } from "../utils/poNumber.util";
import { emailService } from "../services/email.service";
import { POEmailData } from "../types/email/email.types";
import { getReorderSuggestions } from "../services/reorder.service";
import { StockAlertModel } from "../models/StockAlert.models"; // ✅ correct casing
import { ProductModal } from "../models/product.models"; // for stock increment
import {
  getPendingAlerts,
  getPendingAlertCount,
  markAlertAsOrdered,
  dismissAlert,
  resolveAlertsForSkus,
} from "../services/stockAlert.service";

export class PurchaseOrderCustomController {
  // ══════════════════════════════════════════════════════════════════════════
  getAllWithSearch = async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        userId,
        sortBy = "createdAt",
        order = "desc",
      } = req.query;

      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const skip = (pageNumber - 1) * pageSize;
      const queryFilters: any = { isDeleted: false };

      if (userId) queryFilters.userId = userId;
      if (status) queryFilters.status = status;

      if (search) {
        const searchTerm = search as string;
        const matchingSuppliers = await SupplierModel.find({
          isDeleted: false,
          $or: [
            {
              "supplierIdentification.legalBusinessName": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              "supplierIdentification.tradingName": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              "contactInformation.primaryContactName": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              "contactInformation.emailAddress": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              "operationalInformation.orderContactEmail": {
                $regex: searchTerm,
                $options: "i",
              },
            },
          ],
        }).select("_id");
        const supplierIds = matchingSuppliers.map((s: any) => s._id);
        queryFilters.$or = [
          { orderNumber: { $regex: searchTerm, $options: "i" } },
          { orderContactEmail: { $regex: searchTerm, $options: "i" } },
          { notes: { $regex: searchTerm, $options: "i" } },
          { supplier: { $in: supplierIds } },
        ];
      }

      const sortOption: any = {};
      sortOption[sortBy as string] = order === "desc" ? -1 : 1;

      const data = await PurchaseOrder.find(queryFilters)
        .populate("userId", "email role")
        .populate("supplier")
        .populate({ path: "items.productId", select: "productName sku" })
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize)
        .exec();

      const total = await PurchaseOrder.countDocuments(queryFilters);

      res.status(200).json({
        success: true,
        data,
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error: any) {
      console.error("❌ getAllWithSearch:", error);
      res
        .status(500)
        .json({
          success: false,
          message: error.message || "Failed to fetch purchase orders",
        });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // updateStatus — FIXED: increments product stockQuantity on "received"
  // ══════════════════════════════════════════════════════════════════════════

  updateStatus = async (req: Request, res: Response) => {
    try {
      console.log("status is updated here");
      const id = req.params.id as string;
      const { status } = req.body;
      console.log("id", id, "status", status);

      if (!Types.ObjectId.isValid(id))
        return res.status(400).json({ success: false, message: "Invalid ID" });

      const validStatuses = [
        "draft",
        "pending",
        "approved",
        "ordered",
        "received",
        "cancelled",
      ];
      if (!validStatuses.includes(status))
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          });

      const updated = await PurchaseOrder.findByIdAndUpdate(
        id,
        {
          status,
          updatedBy: req.body.userId
            ? new Types.ObjectId(req.body.userId)
            : undefined,
        },
        { new: true, runValidators: true },
      ).populate(["userId"]);

      if (!updated)
        return res
          .status(404)
          .json({ success: false, message: "Purchase order not found" });

      // ─────────────────────────────────────────────────────────────────────
      // STOCK UPDATE ON PO RECEIVED
      // ─────────────────────────────────────────────────────────────────────
      //
      // When status → "received":
      //   For each PO line item we atomically do:
      //     product.attributes[where sku matches].stock.stockQuantity += item.quantity
      //
      // MongoDB arrayFilters targets only the matching attribute variant
      // without loading or replacing the full product document.
      //
      // Example: PO has 41 units of SKU "Autem modi sed quis"
      //   Before: stockQuantity = 59
      //   After:  stockQuantity = 59 + 41 = 100  ← equals maxStockLevel ✅
      //
      //       if (status === "received") {
      //         const items = ((updated as any).items ?? []) as Array<{
      //           productId: Types.ObjectId;
      //           sku:       string;
      //           quantity:  number;
      //         }>;

      //         const stockUpdates = items
      //           .filter(item => item.productId && item.quantity > 0)
      //           .map(async item => {
      //             try {

      //               const result = await ProductModal.updateOne(
      //                 {
      //                   _id:              item.productId as any,
      //                   "attributes.sku": item.sku,
      //                 },
      //                 {
      //                   $inc: {
      //                     // Increment ONLY the matching attribute's stockQuantity
      //                     "attributes.$[attr].stock.stockQuantity": item.quantity,
      //                   },
      //                 },
      //                 {
      //                   arrayFilters: [{ "attr.sku": item.sku }],
      //                 }
      //               );

      //               if (result.modifiedCount === 0) {
      //                 console.warn(`[PO received] ⚠️ Stock NOT updated — productId=${item.productId} sku="${item.sku}" — product or SKU not found`);
      //               } else {
      //                 console.log(`[PO received] ✅ stockQuantity +${item.quantity} for sku="${item.sku}"`);
      //               }
      //             } catch (err) {
      //               console.error(`[PO received] ❌ Stock increment failed — sku="${item.sku}":`, err);
      //             }
      //           });

      //         await Promise.allSettled(stockUpdates);

      //         // Clear stock alerts for the received SKUs
      //        if (updated.userId) {
      //   console.log("updated.userId:", updated.userId);

      //   // ✅ Multiple ways to safely extract ID

      //   // Method 1: Type assertion
      //   const userIdObj = updated.userId as any;
      //   const userIdStr = userIdObj._id ? userIdObj._id.toString() : updated.userId.toString();

      //   // Method 2: Type guard function
      //   function isPopulatedUser(obj: any): obj is { _id: Types.ObjectId } {
      //     return obj && typeof obj === 'object' && '_id' in obj;
      //   }

      //   if (isPopulatedUser(updated.userId)) {
      //     // ✅ TypeScript ab janta hai ke yeh object hai with _id
      //     const userIdStr = updated.userId._id.toString();

      //     const skus = items.map(item => item.sku).filter(Boolean);
      //     await resolveAlertsForSkus(skus, userIdStr);
      //   } else {
      //     // ✅ Direct string ID
      //     const userIdStr = updated.userId.toString();

      //     const skus = items.map(item => item.sku).filter(Boolean);
      //     await resolveAlertsForSkus(skus, userIdStr);
      //   }
      // }
      //       }

      if (status === "cancelled") {
        PurchaseOrder.findById(id)
          .populate("supplier") // ← yeh step missing tha
          .lean()
          .then((populatedPO) =>
            emailService.sendCancellationEmail(populatedPO),
          )
          .catch((err) =>
            console.error("[PO] ⚠️ Cancellation email failed:", err.message),
          );
      }
      // ─────────────────────────────────────────────────────────────────────

      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res
        .status(500)
        .json({
          success: false,
          message: err.message || "Failed to update status",
        });
    }
  };

  generateNextOrderNumber = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId || req.body.userId;
      if (!userId || !Types.ObjectId.isValid(userId as string))
        return res
          .status(400)
          .json({ success: false, message: "Valid userId required" });

      const currentYear = new Date().getFullYear();
      const latestOrder = await PurchaseOrder.findOne({
        orderNumber: new RegExp(`^PO-${currentYear}-`),
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .exec();

      let nextNumber = 1;
      if (latestOrder?.orderNumber) {
        const match = latestOrder.orderNumber.match(/PO-\d{4}-(\d+)/);
        if (match) nextNumber = parseInt(match[1]) + 1;
      }

      const nextOrderNumber = `PO-${currentYear}-${String(nextNumber).padStart(3, "0")}`;
      res.status(200).json({ success: true, nextOrderNumber });
    } catch (err: any) {
      res
        .status(500)
        .json({
          success: false,
          message: err.message || "Failed to generate order number",
        });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId;
      if (!userId || !Types.ObjectId.isValid(userId as string))
        return res
          .status(400)
          .json({ success: false, message: "Valid userId required" });

      const userIdObj = new Types.ObjectId(userId as string);
      const stats = await PurchaseOrder.aggregate([
        { $match: { userId: userIdObj, isDeleted: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalAmount: { $sum: "$total" },
            draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            ordered: {
              $sum: { $cond: [{ $eq: ["$status", "ordered"] }, 1, 0] },
            },
            received: {
              $sum: { $cond: [{ $eq: ["$status", "received"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
      ]);

      const r = stats[0] || {
        total: 0,
        totalAmount: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        ordered: 0,
        received: 0,
        cancelled: 0,
      };

      const reorderAlertCount = await getPendingAlertCount(userId as string);

      res.status(200).json({
        success: true,
        total: r.total,
        totalAmount: r.totalAmount,
        pendingOrders: r.pending + r.approved,
        reorderAlertCount,
        byStatus: {
          draft: r.draft,
          pending: r.pending,
          approved: r.approved,
          ordered: r.ordered,
          received: r.received,
          cancelled: r.cancelled,
        },
      });
    } catch (err: any) {
      res
        .status(500)
        .json({
          success: false,
          message: err.message || "Failed to fetch statistics",
        });
    }
  };

  exportToPDF = async (req: Request, res: Response) => {
    try {
      const { _id, orderId } = req.query; // _id chota I, ya orderId
      console.log("Query params:", { _id, orderId });

      // Build query properly
      const query: any = { isDeleted: false };

      // Handle both _id and orderId
      if (_id) {
        query._id = _id; // _id chota I
      } else if (orderId) {
        query._id = orderId;
      }

      console.log("MongoDB Query:", query);

      const orders = await PurchaseOrder.find(query)
        .populate("supplier")
        .sort({ orderDate: -1 })
        .lean();

      console.log(`Found ${orders.length} orders`);

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No orders found with the given criteria",
        });
      }

      const pdfBuffer = await generatePdfFromTemplate("purchase-orders", {
        companyName: "Humber Mobility Scooter",
        reportTitle: "Purchase Order Report",
        generatedAt: new Date().toLocaleDateString("en-GB"),
        orders,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Humber_Orders.pdf",
      );
      res.status(200).send(pdfBuffer);
    } catch (err: any) {
      console.error("PDF Export Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  };

  bulkUpdate = async (_req: Request, _res: Response) => {
    /* reserved */
  };

  getReorderSuggestions = async (req: Request, res: Response) => {
    try {
      const {
        userId,
        sendEmails = "false",
        createAlerts = "true",
      } = req.query as Record<string, string>;

      if (!userId || !Types.ObjectId.isValid(userId))
        return res
          .status(400)
          .json({ success: false, message: "Valid userId required" });

      const result = await getReorderSuggestions(
        userId,
        sendEmails === "true",
        createAlerts === "true",
      );

      res.status(200).json({
        success: true,
        scannedProducts: result.scannedProducts,
        suggestions: result.suggestions,
        counts: {
          total: result.suggestionsFound,
          critical: result.suggestions.filter((s) => s.severity === "critical")
            .length,
          warning: result.suggestions.filter((s) => s.severity === "warning")
            .length,
          low: result.suggestions.filter((s) => s.severity === "low").length,
        },
        newAlertsCreated: result.newAlertsCreated,
        emailsSent: result.emailsSent,
      });
    } catch (err: any) {
      console.error("❌ getReorderSuggestions:", err);
      res
        .status(500)
        .json({
          success: false,
          message: err.message || "Reorder scan failed",
        });
    }
  };

  createBulkReorderPOs = async (req: Request, res: Response) => {
    try {
      const {
        userId,
        buyerCompany = "Humber Mobility Scooter",
        buyerEmail = "",
        groups = [],
      } = req.body as {
        userId: string;
        buyerCompany: string;
        buyerEmail: string;
        groups: Array<{
          supplierId: string;
          supplierName: string;
          supplierEmail: string;
          expectedDelivery?: string;
          products: Array<{
            productId: string;
            productName: string;
            sku: string;
            suggestedOrderQty: number;
            unitPrice: number;
            maxStockLevel: number;
          }>;
        }>;
      };

      if (!userId || !Types.ObjectId.isValid(userId))
        return res
          .status(400)
          .json({ success: false, message: "Valid userId required" });
      if (!groups.length)
        return res
          .status(400)
          .json({
            success: false,
            message: "At least one supplier group required",
          });

      const poNumbers = await generateBulkPONumbers(groups.length);
      const createdPOs: any[] = [];
      const emailErrors: any[] = [];
      const now = new Date();

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const poNumber = poNumbers[i];

        const items = group.products.map((p) => ({
          productId: new Types.ObjectId(p.productId),
          productName: p.productName,
          sku: p.sku,
          quantity: p.suggestedOrderQty,
          unitPrice: p.unitPrice,
          totalPrice: p.suggestedOrderQty * p.unitPrice,
        }));

        const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);
        const tax = subtotal * 0.2;
        const total = subtotal + tax;

        const expectedDeliveryDate = group.expectedDelivery
          ? new Date(group.expectedDelivery)
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        const po = await PurchaseOrder.create({
          userId,
          orderNumber: poNumber,
          orderDate: now,
          supplier: group.supplierId || undefined,
          orderContactEmail: group.supplierEmail,
          expectedDelivery: expectedDeliveryDate,
          items,
          subtotal,
          tax,
          total,
          status: "draft",
          isReorderPO: true,
          isDeleted: false,
        });

        if (!po) throw new Error(`Failed to create PO ${poNumber}`);
        createdPOs.push({
          _id: po._id,
          orderNumber: poNumber,
          supplier: group.supplierName,
          total,
        });

        await Promise.allSettled(
          group.products.map((p) =>
            markAlertAsOrdered(p.productId, userId, String(po._id)),
          ),
        );

        if (group.supplierEmail) {
          const poEmailData: POEmailData = {
            poNumber,
            orderDate: now.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            expectedDelivery: group.expectedDelivery
              ? new Date(group.expectedDelivery).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "To be confirmed",
            supplierName: group.supplierName,
            supplierEmail: group.supplierEmail,
            buyerCompany,
            buyerEmail,
            items: group.products.map((p) => ({
              productName: p.productName,
              sku: p.sku,
              quantity: p.suggestedOrderQty,
              unitPrice: p.unitPrice,
              totalPrice: p.suggestedOrderQty * p.unitPrice,
            })),
            subtotal,
            vatAmount: tax,
            total,
            paymentTerms: "Net 30 days",
            shippingMethod: "Standard Delivery",
          };
          try {
            await emailService.sendPurchaseOrderToSupplier(poEmailData, {
              bcc: process.env.PO_BCC_EMAIL,
            });
          } catch (emailErr) {
            console.error(
              `[BulkPO] Email failed for ${group.supplierName}:`,
              emailErr,
            );
            emailErrors.push({
              supplier: group.supplierName,
              email: group.supplierEmail,
              error: String(emailErr),
            });
          }
        }
      }

      res.status(201).json({
        success: true,
        created: createdPOs.length,
        poNumbers,
        pos: createdPOs,
        emailErrors: emailErrors.length ? emailErrors : undefined,
        message: `${createdPOs.length} purchase order${createdPOs.length !== 1 ? "s" : ""} created`,
      });
    } catch (err: any) {
      console.error("❌ createBulkReorderPOs:", err);
      res
        .status(500)
        .json({
          success: false,
          message: err.message || "Failed to create bulk POs",
        });
    }
  };

  getStockAlerts = async (req: Request, res: Response) => {
    try {
      const { userId, status = "pending" } = req.query as Record<
        string,
        string
      >;

      console.log("📥 GET /alerts - Request received:", { userId, status });

      if (!userId) {
        console.log("❌ No userId provided");
        return res
          .status(400)
          .json({ success: false, message: "userId is required" });
      }

      if (!Types.ObjectId.isValid(userId)) {
        console.log("❌ Invalid userId format:", userId);
        return res
          .status(400)
          .json({ success: false, message: "Valid userId required" });
      }

      console.log("✅ Valid userId, fetching alerts...");

      const alerts =
        status === "pending"
          ? await getPendingAlerts(userId)
          : await StockAlertModel.find({ userId, status })
              .sort({ createdAt: -1 })
              .lean();

      console.log(`✅ Found ${alerts.length} alerts`);

      return res.status(200).json({
        success: true,
        alerts,
        total: alerts.length,
        critical: (alerts as any[]).filter((a) => a.severity === "critical")
          .length,
        warning: (alerts as any[]).filter((a) => a.severity === "warning")
          .length,
        low: (alerts as any[]).filter((a) => a.severity === "low").length,
      });
    } catch (err: any) {
      console.error("❌ Error in getStockAlerts:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: err.message || "Failed to fetch alerts",
        });
    }
  };

  getStockAlertCount = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query as Record<string, string>;
      if (!userId) return res.status(200).json({ success: true, count: 0 });
      const count = await getPendingAlertCount(userId);
      res.status(200).json({ success: true, count });
    } catch {
      res.status(200).json({ success: true, count: 0 });
    }
  };

  dismissStockAlert = async (req: Request, res: Response) => {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!Types.ObjectId.isValid(id))
        return res
          .status(400)
          .json({ success: false, message: "Invalid alert ID" });
      await dismissAlert(id);
      res.status(200).json({ success: true, message: "Alert dismissed" });
    } catch (err: any) {
      res
        .status(500)
        .json({
          success: false,
          message: err.message || "Failed to dismiss alert",
        });
    }
  };
}

export const purchaseOrderCustomController =
  new PurchaseOrderCustomController();
