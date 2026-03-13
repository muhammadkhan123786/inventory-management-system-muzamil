// ─────────────────────────────────────────────────────────────────────────────
// src/utils/poNumber.util.ts
//
// FIX: Place this file at  src/utils/poNumber.util.ts
//      The controller imports it as: "../utils/poNumber.util"
//      So it must live in the utils/ folder, NOT anywhere else.
//
// WHAT IT DOES:
//   Generates PO numbers like  PO-2026-000042
//   Uses MongoDB atomic counter — no duplicate PO numbers, ever.
//   Even if 10 requests come in at the same time, each gets a unique number.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose, { Schema, Document, Model } from "mongoose";

// ── Counter document (stored in "counters" collection) ────────────────────────

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 },
    },
    { collection: "counters" }
);

// Safe for Express hot-reload
const Counter: Model<ICounter> =
    mongoose.models.Counter ??
    mongoose.model<ICounter>("Counter", CounterSchema);

// ── Single PO number ──────────────────────────────────────────────────────────

/**
 * Generates one PO number atomically.
 * Example output: "PO-2026-000042"
 *
 * Usage:
 *   const poNumber = await generatePONumber();
 *   // → "PO-2026-000042"
 */
export async function generatePONumber(prefix = "PO"): Promise<string> {
    const year = new Date().getFullYear();
    const counterId = `${prefix.toLowerCase()}_${year}`;  // "po_2026"

    const counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }    // creates the doc if first PO of the year
    );

    const padded = String(counter!.seq).padStart(6, "0");
    return `${prefix}-${year}-${padded}`;
    // PO-2026-000001  (first PO of the year)
    // PO-2026-000042
    // PO-2027-000001  (new year = new counter, starts at 1 again)
}

// ── Bulk PO numbers (for Replenishment Proposals bulk creation) ───────────────

/**
 * Generates `count` sequential PO numbers in ONE atomic DB call.
 * Use this when creating multiple POs at once.
 *
 * Example: generateBulkPONumbers(3)
 * → ["PO-2026-000042", "PO-2026-000043", "PO-2026-000044"]
 *
 * Usage:
 *   const poNumbers = await generateBulkPONumbers(groups.length);
 *   // poNumbers[0] → "PO-2026-000042"  (Supplier A)
 *   // poNumbers[1] → "PO-2026-000043"  (Supplier B)
 *   // poNumbers[2] → "PO-2026-000044"  (Supplier C)
 */
export async function generateBulkPONumbers(
    count: number,
    prefix: string = "PO"
): Promise<string[]> {
    if (count <= 0) return [];

    const year = new Date().getFullYear();
    const counterId = `${prefix.toLowerCase()}_${year}`;

    // Increment by count in ONE atomic operation
    const counter = await Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: count } },
        { new: true, upsert: true }
    );

    // counter.seq now = last number assigned
    // Work backwards to get all numbers in the batch
    const lastSeq = counter!.seq;
    const firstSeq = lastSeq - count + 1;

    return Array.from({ length: count }, (_, i) => {
        const padded = String(firstSeq + i).padStart(6, "0");
        return `${prefix}-${year}-${padded}`;
    });
}