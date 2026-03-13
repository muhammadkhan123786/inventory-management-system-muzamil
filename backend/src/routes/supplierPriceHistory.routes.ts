// ─────────────────────────────────────────────────────────────────────────────
// FILE 4: src/routes/supplierPriceHistory.routes.ts
// ─────────────────────────────────────────────────────────────────────────────
import express from "express";
import { supplierPriceHistoryController } from "../controllers/supplierPriceHistory.controller";

const router = express.Router();

// GET  /api/supplier-price-history?productId=xxx&supplierId=yyy&limit=50
router.get("/",       supplierPriceHistoryController.getHistory);

// POST /api/supplier-price-history/manual
router.post("/manual", supplierPriceHistoryController.manualUpdate);
router.get("/:id/stats", supplierPriceHistoryController.getStats);

export default router;

// ─────────────────────────────────────────────────────────────────────────────
// app.ts mein add karo:
//
// import supplierPriceHistoryRoutes from "./routes/supplierPriceHistory.routes";
// app.use("/api/supplier-price-history", supplierPriceHistoryRoutes);
// ─────────────────────────────────────────────────────────────────────────────