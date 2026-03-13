import { Router } from "express";
import {
  getLedgerBySupplier,
  getBalance,
  getAllBalances,
  addAdjustment,
} from "../controllers/ledger.controller";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
//  /api/supplier-ledger
//
//  IMPORTANT: Static routes MUST come before dynamic routes.
//    "all-balances" must be before "/:supplierId"
//    "adjustment"   must be before "/:supplierId"
// ─────────────────────────────────────────────────────────────────────────────

router.get("/all-balances",         getAllBalances);       // GET  /api/supplier-ledger/all-balances
router.post("/adjustment",          addAdjustment);        // POST /api/supplier-ledger/adjustment
router.get("/balance/:supplierId",  getBalance);           // GET  /api/supplier-ledger/balance/:supplierId
router.get("/:supplierId",          getLedgerBySupplier);  // GET  /api/supplier-ledger/:supplierId

export default router;