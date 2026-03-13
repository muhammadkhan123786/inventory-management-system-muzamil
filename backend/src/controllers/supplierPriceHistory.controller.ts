// ─────────────────────────────────────────────────────────────────────────────
// FILE 3: src/controllers/supplierPriceHistory.controller.ts
// ─────────────────────────────────────────────────────────────────────────────
import { Request, Response } from "express";
import { Types }             from "mongoose";
import { ProductModal }      from "../models/product.models";
import { SupplierPriceHistory } from "../models/supplierPriceHistory.model";
import { manualPriceUpdateSchema } from "../schemas/supplierPriceHistory.schema";
import { SupplierModel } from "../models/suppliers/supplier.models";

export class SupplierPriceHistoryController {


  getStats = async (req: Request, res: Response) => {
  const { id } = req.params as any;

  // MongoDB aggregation — sab kuch DB mein calculate hota hai
  const result = await ProductModal.aggregate([

    // Step 1: Sirf woh products jinka koi attribute is supplier se linked ho
    { $match: { "attributes.stock.supplierId": new Types.ObjectId(id) } },

    // Step 2: attributes array ko flatten karo
    { $unwind: "$attributes" },

    // Step 3: Sirf is supplier ke attributes raho
    { $match: { "attributes.stock.supplierId": new Types.ObjectId(id) } },

    // Step 4: Calculate karo
    {
      $group: {
        _id: null,
        totalProducts:  { $sum: 1 },
        activeProducts: {
          $sum: {
            $cond: [{ $gt: ["$attributes.stock.stockQuantity", 0] }, 1, 0]
          }
        },
        totalValue: {
          $sum: {
            $multiply: [
              { $ifNull: [{ $arrayElemAt: ["$attributes.pricing.costPrice", 0] }, 0] },
              { $ifNull: ["$attributes.stock.stockQuantity", 0] }
            ]
          }
        }
      }
    }
  ]);

  // Lead time supplier schema se
  const supplier = await SupplierModel.findById(id)
    .select("productServices.leadTimes")
    .lean();

  const stats = result[0] || { totalProducts: 0, activeProducts: 0, totalValue: 0 };
console.log(" data", {
      totalProducts:  stats.totalProducts,
      activeProducts: stats.activeProducts,
      totalValue:     stats.totalValue,
      leadTime:       supplier?.productServices?.leadTimes || "—",
    })
  res.json({
    success: true,
    data: {
      totalProducts:  stats.totalProducts,
      activeProducts: stats.activeProducts,
      totalValue:     stats.totalValue,
      leadTime:       supplier?.productServices?.leadTimes || "—",
    }
  });
};

  // ══════════════════════════════════════════════════════════════════════
  // GET /api/supplier-price-history
  // Query params: productId, supplierId, limit
  // ══════════════════════════════════════════════════════════════════════
  getHistory = async (req: Request, res: Response) => {
    try {
      const { productId, supplierId, limit = 50 } = req.query;

      const filter: any = {};
      if (productId)  filter.productId  = new Types.ObjectId(String(productId));
      if (supplierId) filter.supplierId = new Types.ObjectId(String(supplierId));

      const history = await SupplierPriceHistory.find(filter)
        .populate("changedBy", "email")
        .populate("productId", "productName sku")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .lean();

      // Add direction arrow for UI (↑ ↓ → new)
      const enriched = history.map((r: any) => ({
        ...r,
        direction:
          r.previousPrice === null  ? "new"  :
          r.newPrice > r.previousPrice ? "up"   :
          r.newPrice < r.previousPrice ? "down" : "same",
        change: r.previousPrice !== null
          ? +(r.newPrice - r.previousPrice).toFixed(2)
          : null,
        changePercent: r.previousPrice
          ? +(((r.newPrice - r.previousPrice) / r.previousPrice) * 100).toFixed(1)
          : null,
      }));

      res.json({ success: true, data: enriched, total: enriched.length });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // POST /api/supplier-price-history/manual
  // Admin manually updates supplier cost price for a product variant
  // This ALSO updates product.attributes[n].pricing[0].costPrice
  // ══════════════════════════════════════════════════════════════════════
  manualUpdate = async (req: Request, res: Response) => {
    try {
      // Validate input
      const parsed = manualPriceUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { productId, supplierId, sku, newPrice, currency, changeReason } = parsed.data;
      const userId = req.body.userId || req.body.changedBy;

      // ── 1. Get current costPrice from product ────────────────────────
      const product = await ProductModal.findOne({
        _id: productId,
        "attributes.sku": sku,
      }).lean() as any;

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found for this SKU",
        });
      }

      const matchedAttr = product.attributes?.find(
        (a: any) => a.sku === sku &&
          String(a.stock?.supplierId) === String(supplierId)
      );

      // Try matched attr first, then any attr with this SKU
      const fallbackAttr  = product.attributes?.find((a: any) => a.sku === sku);
      const targetAttr    = matchedAttr || fallbackAttr;
      const previousPrice = targetAttr?.pricing?.[0]?.costPrice ?? null;

      // ── 2. Update costPrice in product.attributes ────────────────────
      // Using arrayFilters to target the right variant + pricing entry
      const updateResult = await ProductModal.updateOne(
        { _id: productId, "attributes.sku": sku },
        {
          $set: {
            "attributes.$[attr].pricing.$[price].costPrice": newPrice,
          },
        },
        {
          arrayFilters: [
            { "attr.sku": sku },
            { "price.costPrice": { $exists: true } },
          ],
        },
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Could not update product — SKU not found",
        });
      }

      // ── 3. Save price history record ─────────────────────────────────
      const record = await SupplierPriceHistory.create({
        productId,
        supplierId,
        userId,
        sku,
        newPrice,
        previousPrice,
        currency,
        source:       "manual",
        changeReason,
        changedBy:    userId,
      });

      res.status(201).json({
        success: true,
        data:    record,
        message: `Price updated: £${previousPrice ?? "—"} → £${newPrice}`,
      });

    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
}

export const supplierPriceHistoryController = new SupplierPriceHistoryController();

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER
// Call this from stock.service.ts after GRN is processed
// Records the price if it differs from what's currently in the product
// ─────────────────────────────────────────────────────────────────────────────
export async function recordPriceFromGRN(params: {
  productId:  string;
  supplierId: string;
  sku:        string;
  newPrice:   number;
  grnNumber:  string;
  poNumber:   string;
  userId:     string;
}): Promise<void> {
  try {
    const { productId, supplierId, sku, newPrice, grnNumber, poNumber, userId } = params;
    if (!newPrice || newPrice <= 0) return;

    const product = await ProductModal.findOne({
      _id: productId,
      "attributes.sku": sku,
    }).lean() as any;

    if (!product) return;

    const attr          = product.attributes?.find((a: any) => a.sku === sku);
    const previousPrice = attr?.pricing?.[0]?.costPrice ?? null;

    // Only record if price actually changed
    if (previousPrice !== null && previousPrice === newPrice) return;

    // Update product costPrice
    await ProductModal.updateOne(
      { _id: productId, "attributes.sku": sku },
      { $set: { "attributes.$[attr].pricing.$[price].costPrice": newPrice } },
      {
        arrayFilters: [
          { "attr.sku": sku },
          { "price.costPrice": { $exists: true } },
        ],
      },
    );

    // Save history record
    await SupplierPriceHistory.create({
      productId, supplierId, userId, sku,
      newPrice, previousPrice,
      currency:     "GBP",
      source:       "grn",
      changeReason: `Auto-recorded from GRN ${grnNumber}`,
      grnNumber,
      poNumber,
      changedBy:    userId,
    });

    console.log(`[PriceHistory] ✅ GRN price: sku=${sku} £${previousPrice}→£${newPrice} (${grnNumber})`);
  } catch (err: any) {
    // Never block GRN flow — fire and forget
    console.error("[PriceHistory] ❌ recordPriceFromGRN failed:", err.message);
  }
}