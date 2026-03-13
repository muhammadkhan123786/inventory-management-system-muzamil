// routes/purchaseOrder.routes.ts
import express from "express";
import { purchaseOrderCustomController } from "../controllers/purchaseOrder.controller";
import { AdvancedGenericController } from "../controllers/GenericController"
import { GenericService } from "../services/generic.crud.services";
import { PurchaseOrder } from "../models/purchaseOrder.model";
import { interceptAndSendPOEmail } from "../middleware/purchaseOrderEmail.middleware";

const router = express.Router();

// ── Generic CRUD service ─────────────────────────────────────────
const poService = new GenericService(PurchaseOrder);
const genericController = new AdvancedGenericController({
  service: poService,
  populate: [
    { path: "userId", select: "email role" },
    { path: "supplier" },
    { path: "items.productId", select: "productName sku" },
  ],
  searchFields: ["orderNumber", "orderContactEmail", "notes"],
});

// ═════════════════════════════════════════════════════════════════
// ✅ SPECIFIC ROUTES FIRST - These must come BEFORE /:id
// ═════════════════════════════════════════════════════════════════

// GET /api/purchase-orders                      → paginated list
router.get("/", purchaseOrderCustomController.getAllWithSearch);

// GET /api/purchase-orders/meta/next-number     → generate PO number
router.get("/meta/next-number", purchaseOrderCustomController.generateNextOrderNumber);

// GET /api/purchase-orders/meta/stats           → dashboard statistics
router.get("/meta/stats", purchaseOrderCustomController.getStats);

// GET /api/purchase-orders/export/pdf           → export to PDF
router.get("/export/pdf", purchaseOrderCustomController.exportToPDF);

// GET /api/purchase-orders/reorder/suggestions  → reorder suggestions
router.get("/reorder/suggestions", purchaseOrderCustomController.getReorderSuggestions);

// POST /api/purchase-orders/reorder/bulk        → bulk order creation
router.post("/reorder/bulk", purchaseOrderCustomController.createBulkReorderPOs);

// ✅ STOCK ALERT ROUTES - Specific paths
router.get("/alerts/count", purchaseOrderCustomController.getStockAlertCount);  // ← MUST come before /alerts
router.get("/alerts", purchaseOrderCustomController.getStockAlerts);            // ← MUST come before /:id
router.patch("/alerts/:id/dismiss", purchaseOrderCustomController.dismissStockAlert);

// ═════════════════════════════════════════════════════════════════
// ⚠️ PARAMETERIZED ROUTES LAST - These catch any unmatched paths
// ═════════════════════════════════════════════════════════════════

// GET /api/purchase-orders/:id                   → single PO by ID
router.get("/:id", genericController.getById);

// POST /api/purchase-orders                       → create single PO
router.post("/",interceptAndSendPOEmail, genericController.create);

// PUT /api/purchase-orders/:id                    → update single PO
router.put("/:id", genericController.update);

// DELETE /api/purchase-orders/:id                  → soft delete
router.delete("/:id", genericController.delete);

// PATCH /api/purchase-orders/:id/status           → update PO status
router.patch("/:id/status", purchaseOrderCustomController.updateStatus);

// PATCH /api/purchase-orders/bulk-update          → bulk update
router.patch("/bulk-update", purchaseOrderCustomController.bulkUpdate);

export default router;