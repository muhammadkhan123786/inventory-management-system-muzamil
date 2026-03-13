// middleware/grnStock.middleware.ts
import { Request, Response, NextFunction } from "express";
import { applyGRNToStock } from "../services/stock.service";


export const applyGRNStockMiddleware = (
  req:  Request,
  res:  Response,
  next: NextFunction
): void => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any) {
    // ── 1. Send HTTP response immediately ──
    const result = originalJson(body);

    // ── 2. Only fire on successful create ──
    if (res.statusCode >= 200 && res.statusCode < 300 && body?.success) {
      const grn = body?.data;

      if (!grn?._id) {
        return result;
      }

      // ── 3. Fire-and-forget stock update ──
      applyGRNToStock(String(grn._id))
        .then((stockResult) => {
          if (stockResult.success) {
            console.log(
              `[GRNStockMiddleware] ✅ Stock updated for GRN ${grn.grnNumber}`,
              `| Updated: [${stockResult.updated.join(", ")}]`,
              stockResult.skipped.length
                ? `| Skipped: [${stockResult.skipped.join(", ")}]`
                : ""
            );
          } else {
            console.error(
              `[GRNStockMiddleware] ❌ Partial failure for GRN ${grn.grnNumber}:`,
              stockResult.errors
            );
          }
        })
        .catch((err) =>
          console.error(`[GRNStockMiddleware] ❌ Fatal error for GRN ${grn.grnNumber}:`, err.message)
        );
    }

    return result;
  };

  next();
};