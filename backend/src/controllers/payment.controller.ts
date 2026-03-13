import { Request, Response } from "express";
import mongoose from "mongoose";
import {SupplierPayment} from "../models/supplierpayment.model";
import { createCreditEntry } from "../services/ledger.service";
import { CreatePaymentDto } from  "../../../common/ISupplierledger.interface";

// ─────────────────────────────────────────────────────────────────────────────
//  PAYMENT CONTROLLER
//
//  Routes (registered in payment.routes.ts):
//    POST   /api/supplier-payment                    → recordPayment
//    GET    /api/supplier-payment/summary            → getAllSupplierPaymentSummary
//    GET    /api/supplier-payment/:supplierId        → getPaymentsBySupplier
//    PATCH  /api/supplier-payment/:id               → updatePayment
//    DELETE /api/supplier-payment/:id               → deletePayment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/supplier-payment
 * Record a manual payment + auto-create CREDIT ledger entry.
 */
export const recordPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      supplierId,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      grnIds,
      notes,
      createdBy,
      userId,
    }: CreatePaymentDto = req.body;
console.log("userId", userId)
    console.log("request is coming here ", req.body)
    if (!supplierId || !amount || !paymentMethod) {
      res.status(400).json({
        success: false,
        message: "supplierId, amount, and paymentMethod are required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      res.status(400).json({ success: false, message: "Invalid supplierId" });
      return;
    }

    // Step 1: Save the payment record
    const payment = await SupplierPayment.create({
      supplierId,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod,
      referenceNumber: referenceNumber?.trim(),
      grnIds: Array.isArray(grnIds) ? grnIds : [],
      notes:           notes?.trim(),
     recordedBy: userId,
    } as any );

    if (!payment) {
  res.status(404).json({ success: false, message: "Payment not found" });
  return;
}
    // Step 2: Auto-create CREDIT ledger entry
    const refNumber = referenceNumber?.trim() || 
    `PAY-${payment._id.toString().slice(-6).toUpperCase()}`;

    const ledgerEntry = await createCreditEntry({
      supplierId,
      amount,
      referenceType:   "PAYMENT",
      referenceId:     payment?._id as mongoose.Types.ObjectId,
      referenceNumber: refNumber,
      notes:           notes || `Payment via ${paymentMethod}`,
      createdBy:       createdBy || (req as any).user?.name || "system",
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded and ledger updated",
      data: {
        payment,
        ledgerEntry,
      },
    });
  } catch (error: any) {
    console.error("[PaymentController] recordPayment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error:   error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/supplier-payment/:supplierId
 * All payments for a specific supplier with pagination + date filter.
 */
export const getPaymentsBySupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { supplierId } = req.params;
     const supplierId = Array.isArray(req.params.supplierId) ? req.params.supplierId[0] : req.params.supplierId;
    const {
      page      = "1",
      limit     = "20",
      startDate,
      endDate,
    } = req.query as Record<string, string>;

    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      res.status(400).json({ success: false, message: "Invalid supplierId" });
      return;
    }

    const filter: Record<string, any> = {
      supplierId,
      isDeleted: { $ne: true },
    };

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate)   filter.paymentDate.$lte = new Date(endDate);
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));

    const [payments, total] = await Promise.all([
      SupplierPayment.find(filter)
        .populate("supplierId", "name email phone")
        // .populate("grnIds",    "grnNumber totalAmount")
        .sort({ paymentDate: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),

      SupplierPayment.countDocuments(filter),
    ]);

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        payments,
        totalPaid,
        pagination: {
          total,
          page:       pageNum,
          limit:      limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error("[PaymentController] getPaymentsBySupplier:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/supplier-payment/summary
 * Total payments grouped by supplier — for dashboard cards.
 */
export const getAllSupplierPaymentSummary = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const summary = await SupplierPayment.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id:          "$supplierId",
          totalPaid:    { $sum: "$amount" },
          paymentCount: { $sum: 1 },
          lastPayment:  { $max: "$paymentDate" },
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
      // { $unwind: { path: "$supplier", preserveNullAndEmpty: true } },
      { $unwind: { path: "$supplier" } },

      {
        $project: {
          supplierId:   "$_id",
          supplierName: "$supplier.name",
          totalPaid:    1,
          paymentCount: 1,
          lastPayment:  1,
        },
      },
      { $sort: { totalPaid: -1 } },
    ]);

    res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * PATCH /api/supplier-payment/:id
 * Update notes / referenceNumber / paymentMethod.
 * Amount change is NOT supported — delete and re-create instead.
 */
export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { id } = req.params;
    const { notes, referenceNumber, paymentMethod } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid payment ID" });
      return;
    }

    const payment = await SupplierPayment.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(notes           !== undefined && { notes }),
          ...(referenceNumber !== undefined && { referenceNumber }),
          ...(paymentMethod   !== undefined && { paymentMethod }),
        },
      },
      { new: true, runValidators: true }
    ).populate("supplierId", "name");

    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Payment updated",
      data:    payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * DELETE /api/supplier-payment/:id
 * Soft delete — sets isDeleted: true.
 * Ledger entry is kept for audit trail.
 */
export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { id } = req.params;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid payment ID" });
      return;
    }

    const payment = await SupplierPayment.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Payment deleted",
      data:    payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};