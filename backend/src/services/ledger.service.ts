import mongoose, { ClientSession } from "mongoose";
import SupplierLedger, { ISupplierLedger } from "../models/supplierLedger.models";
import {
  LedgerDirection,
  LedgerRefType,
  LedgerSummary,
  SupplierBalance,
} from "../../../common/ISupplierledger.interface";

// ─────────────────────────────────────────────────────────────────────────────
//  LEDGER SERVICE
//  Internal — NO routes exposed.
//  Called automatically by:
//    grnController.ts   → updateGRNStatus()   → status === "received"   → createDebitEntry()
//    grtnController.ts  → updateGRTNStatus()  → status === "completed"  → createCreditEntry()
//    paymentController.ts → recordPayment()                             → createCreditEntry()
//
//  Balance formula:
//    Outstanding = Σ Debits (GRN received) − Σ Credits (GRTN completed + Payments)
// ─────────────────────────────────────────────────────────────────────────────

// ── Interfaces for service input ──────────────────────────────────────────────

interface DebitEntryInput {
  supplierId:       string | mongoose.Types.ObjectId;
  amount:           number;
  referenceType?:   LedgerRefType;
  referenceId?:     string | mongoose.Types.ObjectId;
  referenceNumber?: string;
  notes?:           string;
  createdBy?:       string;
  session?:         ClientSession; // for multi-document transactions
}

interface CreditEntryInput extends DebitEntryInput {
  referenceType: LedgerRefType; // required for credit
}

interface AdjustmentInput {
  supplierId:  string | mongoose.Types.ObjectId;
  amount:      number;
  direction:   LedgerDirection;
  notes:       string;
  createdBy?:  string;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current running balance for a supplier.
 * Reads balanceAfter from the most recent ledger entry — O(1) with index.
 * Returns 0 if no entries exist yet.
 */
export const getRunningBalance = async (
  supplierId: string | mongoose.Types.ObjectId
): Promise<number> => {
  const lastEntry = await SupplierLedger.findOne(
    { supplierId },
    { balanceAfter: 1 },
    { sort: { createdAt: -1 } }
  ).lean();

  return lastEntry?.balanceAfter ?? 0;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a DEBIT ledger entry — balance increases.
 * Call this when: GRN status changes to "received"
 * Meaning: goods received, we owe supplier more money.
 */
export const createDebitEntry = async (
  input: DebitEntryInput
): Promise<ISupplierLedger> => {
  const {
    supplierId,
    amount,
    referenceType = "GRN",
    referenceId,
    referenceNumber,
    notes,
    createdBy,
    session,
  } = input;

  const balanceBefore = await getRunningBalance(supplierId);
  const balanceAfter  = balanceBefore + amount;

  const payload = {
    supplierId,
    type:       "purchase" as const,
    direction:  "debit"   as const,
    amount,
    referenceType,
    referenceId,
    referenceNumber,
    balanceBefore,
    balanceAfter,
    notes:     notes || `GRN received: ${referenceNumber ?? ""}`,
    createdBy,
    date:      new Date(),
  };

  const result = session
    ? await SupplierLedger.create([payload], { session })
    : await SupplierLedger.create(payload);

  const entry = Array.isArray(result) ? result[0] : result;

  console.info(
    `[LedgerService] DEBIT  | Supplier: ${supplierId} | +£${amount} | Balance: £${balanceBefore} → £${balanceAfter}`
  );

  return entry;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a CREDIT ledger entry — balance decreases.
 * Call this when:
 *   - GRTN status changes to "completed"  (referenceType: "GRTN")
 *   - A payment is recorded               (referenceType: "PAYMENT")
 */
export const createCreditEntry = async (
  input: CreditEntryInput
): Promise<ISupplierLedger> => {
  const {
    supplierId,
    amount,
    referenceType,
    referenceId,
    referenceNumber,
    notes,
    createdBy,
    session,
  } = input;

  const balanceBefore = await getRunningBalance(supplierId);
  // Never go below 0 — guard against data issues
  const balanceAfter  = Math.max(0, balanceBefore - amount);

  const entryType = referenceType === "GRTN" ? "return" : "payment";

  const payload = {
    supplierId,
    type:       entryType as "return" | "payment",
    direction:  "credit" as const,
    amount,
    referenceType,
    referenceId,
    referenceNumber,
    balanceBefore,
    balanceAfter,
    notes:     notes || `${referenceType}: ${referenceNumber ?? ""}`,
    createdBy,
    date:      new Date(),
  };

  const result = session
    ? await SupplierLedger.create([payload], { session })
    : await SupplierLedger.create(payload);

  const entry = Array.isArray(result) ? result[0] : result;

  console.info(
    `[LedgerService] CREDIT | Supplier: ${supplierId} | -£${amount} | Balance: £${balanceBefore} → £${balanceAfter}`
  );

  return entry;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manual adjustment entry (corrections, write-offs etc.)
 */
export const createAdjustmentEntry = async (
  input: AdjustmentInput
): Promise<ISupplierLedger> => {
  const { supplierId, amount, direction, notes, createdBy } = input;

  const balanceBefore = await getRunningBalance(supplierId);
  const balanceAfter  =
    direction === "debit" ? balanceBefore + amount : Math.max(0, balanceBefore - amount);

  return await SupplierLedger.create({
    supplierId,
    type:          "adjustment",
    direction,
    amount,
    referenceType: "MANUAL",
    balanceBefore,
    balanceAfter,
    notes,
    createdBy,
    date:          new Date(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get balance by aggregation (recalculates from scratch — always accurate).
 * Use for verification or reconciliation reports.
 * For fast reads, use getRunningBalance() instead.
 */
export const getAggregatedBalance = async (
  supplierId: string
): Promise<LedgerSummary> => {
  const result = await SupplierLedger.aggregate([
    {
      $match: {
        supplierId: new mongoose.Types.ObjectId(supplierId),
      },
    },
    {
      $group: {
        _id: "$supplierId",
        totalDebit: {
          $sum: { $cond: [{ $eq: ["$direction", "debit"]  }, "$amount", 0] },
        },
        totalCredit: {
          $sum: { $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0] },
        },
        totalPurchases: {
          $sum: { $cond: [{ $eq: ["$type", "purchase"] }, "$amount", 0] },
        },
        totalReturns: {
          $sum: { $cond: [{ $eq: ["$type", "return"]   }, "$amount", 0] },
        },
        totalPayments: {
          $sum: { $cond: [{ $eq: ["$type", "payment"]  }, "$amount", 0] },
        },
        entryCount: { $sum: 1 },
      },
    },
    {
      $addFields: {
        outstanding: { $subtract: ["$totalDebit", "$totalCredit"] },
      },
    },
  ]);

  if (!result.length) {
    return {
      totalDebit: 0, totalCredit: 0,
      totalPurchases: 0, totalReturns: 0, totalPayments: 0,
      outstanding: 0, entryCount: 0,
    };
  }

  return result[0] as LedgerSummary;
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get outstanding balances for ALL suppliers (dashboard summary).
 */
export const getAllSupplierBalances = async (): Promise<SupplierBalance[]> => {
  return await SupplierLedger.aggregate([
    {
      $group: {
        _id: "$supplierId",
        totalDebit:  { $sum: { $cond: [{ $eq: ["$direction", "debit"]  }, "$amount", 0] } },
        totalCredit: { $sum: { $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0] } },
        lastTransaction: { $max: "$date" },
      },
    },
    {
      $addFields: {
        outstanding: { $subtract: ["$totalDebit", "$totalCredit"] },
      },
    },
    {
      $lookup: {
        from:         "suppliers",
        localField:   "_id",
        foreignField: "_id",
        as:           "supplier",
      },
    },
    {
      $unwind: { path: "$supplier" },
    },
    // {
    //   $unwind: { path: "$supplier", preserveNullAndEmpty: true },
    // },
    {
      $project: {
        supplierId:     "$_id",
        supplierName:   "$supplier.name",
        supplierEmail:  "$supplier.email",
        totalDebit:     1,
        totalCredit:    1,
        outstanding:    1,
        lastTransaction: 1,
      },
    },
    { $sort: { outstanding: -1 } }, // highest balance first
  ]);
};