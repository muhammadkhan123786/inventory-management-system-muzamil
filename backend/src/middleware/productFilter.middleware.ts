// middleware/productFilter.middleware.ts
import { Request, Response, NextFunction } from "express";

export const buildProductFilter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, categoryId, status, stockStatus, featured } =
      req.query as Record<string, string>;

    const filter: any = {};

    // ── 1. Search ──────────────────────────────────────────────────────────
    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { productName: regex },
        { sku: regex },
        { barcode: regex },
        { brand: regex },
        { manufacturer: regex },
        { modelNumber: regex },
        { description: regex },
        { shortDescription: regex },
        { tags: regex },
        { keywords: regex },
      ];
    }

    // ── 2. Category ────────────────────────────────────────────────────────
    if (categoryId && categoryId !== "all") {
      (req as any).filterCategoryId = categoryId;
    }

    // ── 3. Status → root-level `isActive` boolean ─────────────────────────
    if (status && status !== "all") {
      if (status === "active")        filter.isActive = true;
      else if (status === "inactive") filter.isActive = false;
      console.log(`[Filter] status "${status}" → isActive: ${filter.isActive}`);
    }

    // ── 4. Stock status → nested inside `stock` subdocument ───────────────
    //    DB path: stock.stockStatus  (e.g. "in-stock", "out-of-stock", "low-stock")
    if (stockStatus && stockStatus !== "all") {
      filter["attributes.stock.stockStatus"] = stockStatus;
      console.log(`[Filter] stock.stockStatus → "${stockStatus}"`);
    }

    // ── 5. Featured → nested inside `stock` subdocument ───────────────────
    //    DB path: stock.featured  (boolean)
    if (featured === "true") {
      filter["attributes.stock.featured"] = true;
      console.log(`[Filter] stock.featured → true`);
    }

    console.log("[Filter] Built filter:", JSON.stringify(filter));
    (req as any).productFilter = filter;
    next();
  } catch (err) {
    next(err);
  }
};