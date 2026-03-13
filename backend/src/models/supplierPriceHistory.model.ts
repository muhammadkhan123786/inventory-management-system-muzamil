// ─────────────────────────────────────────────────────────────────────────────
// FILE 2: src/models/supplierPriceHistory.model.ts
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from "mongoose";
import { SupplierPriceHistorySchema } from "../schemas/supplierPriceHistory.schema";

export const SupplierPriceHistory = mongoose.model(
  "SupplierPriceHistory",
  SupplierPriceHistorySchema,
);