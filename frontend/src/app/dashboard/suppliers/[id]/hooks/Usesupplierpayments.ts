// hooks/useSupplierPayments.ts
// ─────────────────────────────────────────────────────────────────────────────
// Supplier ka payment history + credit notes + outstanding balance
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SupplierPayment {
  _id:             string;
  paymentNumber:   string;
  amount:          number;
  currency:        string;
  paymentMethod:   "bank_transfer" | "cheque" | "cash" | "credit_note" | "other";
  paymentStatus:   "pending" | "completed" | "failed" | "cancelled";
  paymentDate:     string;
  referenceNumber?: string;
  notes?:          string;
  creditApplied?:  number;
  purchaseOrderId?: { _id: string; orderNumber: string };
  grnId?:          { _id: string; grnNumber:   string };
  recordedBy?:     { name: string; email: string };
  createdAt:       string;
}

export interface CreditNote {
  _id:              string;
  creditNoteNumber: string;
  totalAmount:      number;
  remainingAmount:  number;
  usedAmount:       number;
  currency:         string;
  status:           "open" | "partially_used" | "fully_used" | "cancelled";
  goodsReturnId?:   { _id: string; grtnNumber: string; status: string };
  grnId?:           { _id: string; grnNumber:  string };
  items:            any[];
  createdAt:        string;
}

export interface PaymentSummary {
  totalPaid:       number;
  availableCredit: number;
  totalPayments:   number;
}

export interface RecordPaymentPayload {
  supplierId:      string;
  amount:          number;
  currency?:       string;
  paymentMethod:   string;
  paymentDate:     string;
  purchaseOrderId?: string;
  grnId?:          string;
  referenceNumber?: string;
  notes?:          string;
  creditNoteId?:   string;
  creditApplied?:  number;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSupplierPayments(supplierId: string) {
  const [payments,    setPayments]    = useState<SupplierPayment[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [summary,     setSummary]     = useState<PaymentSummary>({
    totalPaid:       0,
    availableCredit: 0,
    totalPayments:   0,
  });
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [payRes, cnRes] = await Promise.all([
        axios.get(`${BASE_URL}/supplier-payments/by-supplier/${supplierId}`,    { headers }),
        axios.get(`${BASE_URL}/supplier-credit-notes/by-supplier/${supplierId}`, { headers }),
      ]);

      setPayments(payRes.data?.data?.payments    ?? []);
      setSummary( payRes.data?.data?.summary     ?? { totalPaid: 0, availableCredit: 0, totalPayments: 0 });
      setCreditNotes(cnRes.data?.data            ?? []);

    } catch (err) {
      console.error("[useSupplierPayments]", err);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Record new payment ──────────────────────────────────────────────────
  const recordPayment = async (payload: RecordPaymentPayload) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await axios.post(`${BASE_URL}/supplier-payments`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Optimistic update
      setPayments(prev => [res.data.data, ...prev]);
      setSummary(prev => ({
        ...prev,
        totalPaid:     prev.totalPaid + payload.amount,
        totalPayments: prev.totalPayments + 1,
        availableCredit: prev.availableCredit - (payload.creditApplied || 0),
      }));

      toast.success(`Payment ${res.data.data.paymentNumber} recorded`);
      await fetchAll(); // refresh for accurate data
      return res.data.data;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel payment ──────────────────────────────────────────────────────
  const cancelPayment = async (paymentId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${BASE_URL}/supplier-payments/${paymentId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Payment cancelled");
      await fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel payment");
    }
  };

  return {
    payments, creditNotes, summary, loading, submitting,
    recordPayment, cancelPayment, refetch: fetchAll,
  };
}