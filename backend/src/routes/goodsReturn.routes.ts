// routes/goodsReturn.routes.ts
import express from "express";
import { AdvancedGenericController } from "../controllers/GenericController";
import { GenericService }            from "../services/generic.crud.services";
import { GoodsReturn }               from "../models/goodsReturn.model";
import { CreateGoodsReturnValidation } from "../schemas/goodsReturn.schema";
import { updateGoodsReturnStatus, getReturnsBySupplier, getReturnStatsBySupplier }     from "../controllers/goodsReturn.controller";
import { exportGRTNToPDF } from "../controllers/pdf.controller"


const router = express.Router();

const returnService     = new GenericService(GoodsReturn);
const genericController = new AdvancedGenericController({
  service:          returnService,
  validationSchema: CreateGoodsReturnValidation,
  populate: [
    {
      path:   "grnId",
      select: "grnNumber purchaseOrderId",
      populate: {
        path:   "purchaseOrderId",
        select: "orderNumber supplier",
        populate: { path: "supplier", select: "contactInformation supplierIdentification" }
      }
    },
  ],
  searchFields: ["grtnNumber", "returnReference", "returnedBy"],
});


router.get("/export/:id", exportGRTNToPDF);
// ── CRUD ──────────────────────────────────────────────────────────────────

router.get("/",    genericController.getAll);
router.get("/:id", genericController.getById);

// ✅ POST: NO stock middleware here
// Stock ONLY decreases when status → "completed" via PATCH below
// Middleware was wrong — it fired on create, not on completion
router.post("/",      genericController.create);
router.put("/:id",    genericController.update);
router.delete("/:id", genericController.delete);

// ── Status Update — stock fires HERE on "completed" ──────────────────────
router.patch("/:id/status", updateGoodsReturnStatus);
router.get("/by-supplier/:supplierId", getReturnsBySupplier)
router.get("/stats/by-supplier/:supplierId", getReturnStatsBySupplier);

export default router;