// middleware/goodsReturnStock.middleware.ts
import { Request, Response, NextFunction } from "express";
import { applyReturnToStock } from "../services/stock.service";

/**
 * Intercepts res.json() after genericController.create saves the GoodsReturn.
 * Decreases stock by returnQty — fire-and-forget.
 *
 * Usage in goodsReturn.routes.ts:
 *   router.post("/", applyReturnStockMiddleware, genericController.create);
 */
export const applyReturnStockMiddleware = (
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
      const goodsReturn = body?.data;

      if (!goodsReturn?._id) {
        return result;
      }

      // ── 3. Validate items have productId + sku before firing ──
      const hasTraceable = goodsReturn.items?.some(
        (item: any) => item.productId && item.sku && item.returnQty > 0
      );

      if (!hasTraceable) {
        console.warn(
          `[ReturnStockMiddleware] ⚠️ GoodsReturn ${goodsReturn.grtnNumber} has no traceable items — skipping stock update.`
        );
        return result;
      }

      // ── 4. Fire-and-forget ──
      applyReturnToStock(String(goodsReturn._id))
        .then((stockResult) => {
          if (stockResult.success) {
            console.log(
              `[ReturnStockMiddleware] ✅ Stock reversed for return ${goodsReturn.grtnNumber}`,
              `| Reversed: [${stockResult.updated.join(", ")}]`
            );
          } else {
            console.error(
              `[ReturnStockMiddleware] ❌ Partial failure for ${goodsReturn.grtnNumber}:`,
              stockResult.errors
            );
          }
        })
        .catch((err) =>
          console.error(
            `[ReturnStockMiddleware] ❌ Fatal error for ${goodsReturn.grtnNumber}:`,
            err.message
          )
        );
    }

    return result;
  };

  next();
};