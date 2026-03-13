import { Request, Response } from "express";
import mongoose from "mongoose";
import SupplierLedger from "../models/supplierLedger.models";
import {
  getRunningBalance,
  getAggregatedBalance,
  getAllSupplierBalances,
  createAdjustmentEntry,
} from "../services/ledger.service";
import { CreateAdjustmentDto, LedgerEntryType, LedgerDirection } from "../../../common/ISupplierledger.interface";

// ─────────────────────────────────────────────────────────────────────────────
//  LEDGER CONTROLLER
//
//  Routes (registered in ledger.routes.ts):
//    GET  /api/supplier-ledger/all-balances         → getAllBalances
//    GET  /api/supplier-ledger/balance/:supplierId  → getBalance
//    GET  /api/supplier-ledger/:supplierId          → getLedgerBySupplier
//    POST /api/supplier-ledger/adjustment           → addAdjustment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/supplier-ledger/:supplierId
 * Full ledger history for one supplier with filters + pagination.
 * Also returns aggregated summary (total debit, credit, outstanding).
 */
export const getLedgerBySupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("request is coming here")
    // const { supplierId } = req.params;
    const supplierId = Array.isArray(req.params.supplierId) ? req.params.supplierId[0] : req.params.supplierId;
console.log("id", supplierId);
// const objectId = new mongoose.Types.ObjectId(id);
    const {
      page      = "1",
      limit     = "50",
      type,
      direction,
      startDate,
      endDate,
    } = req.query as Record<string, string>;

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      res.status(400).json({ success: false, message: "Invalid supplierId" });
      return;
    }

    const filter: Record<string, any> = { supplierId };

    if (type      && type !== "all")      filter.type      = type as LedgerEntryType;
    if (direction && direction !== "all") filter.direction = direction as LedgerDirection;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, parseInt(limit));

    const [entries, total, summary] = await Promise.all([
      // Ledger entries — oldest first for running balance display
      SupplierLedger.find(filter)
        .populate("supplierId", "name email")
        .sort({ createdAt: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),

      SupplierLedger.countDocuments(filter),

      // Aggregated summary — always accurate from scratch
      getAggregatedBalance(supplierId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        entries,
        summary: {
          totalPurchases: summary.totalPurchases,
          totalReturns:   summary.totalReturns,
          totalPayments:  summary.totalPayments,
          totalDebit:     summary.totalDebit,
          totalCredit:    summary.totalCredit,
          outstanding:    summary.outstanding,
          entryCount:     summary.entryCount,
        },
        pagination: {
          total,
          page:       pageNum,
          limit:      limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("[LedgerController] getLedgerBySupplier:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/supplier-ledger/balance/:supplierId
 * Current outstanding balance — both fast + verified versions.
 */
export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplierId = Array.isArray(req.params.supplierId) ? req.params.supplierId[0] : req.params.supplierId;

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      res.status(400).json({ success: false, message: "Invalid supplierId" });
      return;
    }

    const [runningBalance, summary] = await Promise.all([
      getRunningBalance(supplierId),
      getAggregatedBalance(supplierId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        supplierId,
        outstanding:    summary.outstanding,   // verified from aggregate
        runningBalance,                         // fast — last entry snapshot
        breakdown: {
          totalPurchases: summary.totalPurchases,
          totalReturns:   summary.totalReturns,
          totalPayments:  summary.totalPayments,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/supplier-ledger/all-balances
 * Outstanding balance for ALL suppliers — dashboard cards.
 */
export const getAllBalances = async (_req: Request, res: Response): Promise<void> => {
  try {
    const balances = await getAllSupplierBalances();

    const totalOutstanding = balances.reduce(
      (sum, b) => sum + (b.outstanding || 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        suppliers:        balances,
        totalOutstanding,
        supplierCount:    balances.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/supplier-ledger/adjustment
 * Manual correction / write-off entry.
 */
export const addAdjustment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      supplierId,
      amount,
      direction,
      notes,
      createdBy,
    }: CreateAdjustmentDto = req.body;

    if (!supplierId || !amount || !direction || !notes) {
      res.status(400).json({
        success: false,
        message: "supplierId, amount, direction, and notes are required",
      });
      return;
    }

    if (!["debit", "credit"].includes(direction)) {
      res.status(400).json({
        success: false,
        message: 'direction must be "debit" or "credit"',
      });
      return;
    }

    const entry = await createAdjustmentEntry({
      supplierId,
      amount,
      direction,
      notes,
      createdBy: createdBy || (req as any).user?.name || "system",
    });

    res.status(201).json({
      success: true,
      message: "Adjustment entry created",
      data:    entry,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};