import { Router } from "express";
import {
  recordPayment,
  getPaymentsBySupplier,
  getAllSupplierPaymentSummary,
  updatePayment,
  deletePayment,
} from "../controllers/payment.controller";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
//  /api/supplier-payment
//
//  IMPORTANT: Static routes MUST come before dynamic /:supplierId routes.
//  Otherwise Express treats "summary" as a supplierId param.
// ─────────────────────────────────────────────────────────────────────────────

router.get("/summary", getAllSupplierPaymentSummary);     // GET /api/supplier-payment/summary
router.post("/",       recordPayment);                    // POST /api/supplier-payment
router.get("/:supplierId", getPaymentsBySupplier);        // GET /api/supplier-payment/:supplierId
router.patch("/:id",   updatePayment);                    // PATCH /api/supplier-payment/:id
router.delete("/:id",  deletePayment);                    // DELETE /api/supplier-payment/:id

export default router;