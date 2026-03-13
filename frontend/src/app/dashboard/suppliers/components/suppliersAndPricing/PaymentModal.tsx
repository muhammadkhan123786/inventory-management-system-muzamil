"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  PaymentModal
//  Path: ../components/supplier-ledger/PaymentModal.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { CreatePaymentDto, PaymentMethod } from "../../../../../../../common/ISupplierledger.interface";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PaymentModalProps {
  isOpen:             boolean;
  onClose:            () => void;
  supplierId:         string;
  supplierName:       string;
  outstandingBalance: number;
  createdBy?:         string;
  onSubmit: (data: CreatePaymentDto) => Promise<{ success: boolean; message: string }>;
}

interface FormState {
  amount:          string;
  paymentDate:     string;
  paymentMethod:   PaymentMethod;
  referenceNumber: string;
  notes:           string;
}

const INITIAL_FORM: FormState = {
  amount:          "",
  paymentDate:     new Date().toISOString().split("T")[0],
  paymentMethod:   "bank_transfer",
  referenceNumber: "",
  notes:           "",
};

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
  { value: "cheque",        label: "Cheque",        icon: "📋" },
  { value: "cash",          label: "Cash",          icon: "💵" },
  { value: "online",        label: "Online",        icon: "💻" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentModal({
  isOpen,
  onClose,
  supplierId,
  supplierName,
  outstandingBalance,
  createdBy,
  onSubmit,
}: PaymentModalProps) {
  const [form,        setForm]        = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback,    setFeedback]    = useState<{ type: "success" | "error"; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFeedback(null);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleFullAmount = () => {
    setForm((prev) => ({ ...prev, amount: String(outstandingBalance) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const amount = parseFloat(form.amount);

    if (!amount || amount <= 0) {
      setFeedback({ type: "error", msg: "Please enter a valid amount greater than 0" });
      return;
    }
    if (amount > outstandingBalance * 1.01) {
      setFeedback({
        type: "error",
        msg:  `Amount (£${amount.toFixed(2)}) exceeds outstanding balance (£${outstandingBalance.toFixed(2)})`,
      });
      return;
    }

    setIsSubmitting(true);

    const result = await onSubmit({
      supplierId,
      amount,
      paymentDate:     form.paymentDate || new Date().toISOString(),
      paymentMethod:   form.paymentMethod,
      referenceNumber: form.referenceNumber.trim() || undefined,
      notes:           form.notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setFeedback({ type: "success", msg: result.message });
      setTimeout(() => {
        onClose();
        setForm(INITIAL_FORM);
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback({ type: "error", msg: result.message });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Record Payment</h2>
            <p className="text-blue-200 text-sm mt-0.5">{supplierName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white text-2xl leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {/* ── Outstanding Badge ── */}
        <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">Outstanding Balance</span>
          <span className="text-orange-600 font-bold text-xl">
            £{outstandingBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Amount (£) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={handleFullAmount}
                className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-xl px-4 py-2.5 hover:bg-orange-100 transition-colors whitespace-nowrap font-semibold"
              >
                Full Amount
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleMethodSelect(m.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    form.paymentMethod === m.value
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date + Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Reference No.
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={form.referenceNumber}
                onChange={handleChange}
                placeholder="TXN / Cheque #"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any notes about this payment..."
              rows={2}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl font-medium border ${
                feedback.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <span>{feedback.type === "success" ? "✅" : "❌"}</span>
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin text-base">⏳</span>
                  Recording...
                </>
              ) : (
                "Record Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}