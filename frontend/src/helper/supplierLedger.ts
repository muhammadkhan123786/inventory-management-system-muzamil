// ─────────────────────────────────────────────────────────────────────────────
//  SUPPLIER LEDGER + PAYMENT HELPERS
//  Path: ../helper/supplierLedger.ts
//  Matches your existing pattern from: ../helper/goodsReturn.ts
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import {
  LedgerEntry,
  LedgerSummary,
  SupplierPayment,
  SupplierBalance,
  CreatePaymentDto,
  LedgerFilters,
} from "../../../common/ISupplierledger.interface";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


const getAuthConfig = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { 
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    } 
  };
};

const getUserId = () => {
  if (typeof window === "undefined") return "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.id || user._id || "";
};
// ── Ledger Helpers ────────────────────────────────────────────────────────────

/**
 * Fetch full ledger history for a supplier
 */
export const fetchLedgerBySupplier = async (
  supplierId: string,
  filters: LedgerFilters = {}
) => {
  const params = new URLSearchParams();

  if (filters.page)      params.append("page",  String(filters.page));
  if (filters.limit)     params.append("limit", String(filters.limit));
  if (filters.type && filters.type !== "all")           params.append("type",      filters.type);
  if (filters.direction && filters.direction !== "all") params.append("direction", filters.direction);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate)   params.append("endDate",   filters.endDate);

  const response = await axios.get(
    `${BASE_URL}/supplier-ledger/${supplierId}?${params.toString()}`,
    getAuthConfig()
  );

  console.log('response', response);
  return response.data as {
    success: boolean;
    data: {
      entries:    LedgerEntry[];
      summary:    LedgerSummary;
      pagination: { total: number; page: number; limit: number; totalPages: number };
    };
  };
};

/**
 * Fetch outstanding balance for a supplier
 */
export const fetchSupplierBalance = async (supplierId: string) => {
  const response = await axios.get(
    `${BASE_URL}/supplier-ledger/balance/${supplierId}`,
    getAuthConfig()
  );
  return response.data as {
    success: boolean;
    data: {
      supplierId:    string;
      outstanding:   number;
      runningBalance: number;
      breakdown: {
        totalPurchases: number;
        totalReturns:   number;
        totalPayments:  number;
      };
    };
  };
};

/**
 * Fetch all supplier balances — for dashboard
 */
export const fetchAllSupplierBalances = async () => {
  const response = await axios.get(`${BASE_URL}/supplier-ledger/all-balances`, getAuthConfig());
  return response.data as {
    success: boolean;
    data: {
      suppliers:        SupplierBalance[];
      totalOutstanding: number;
      supplierCount:    number;
    };
  };
};

// ── Payment Helpers ───────────────────────────────────────────────────────────

/**
 * Record a new manual payment
 */
export const recordSupplierPayment = async (payload: CreatePaymentDto) => {
    console.log("payload", payload);
    const fullData = {
        ... payload,
        userId: getUserId()
    }
  const response = await axios.post(`${BASE_URL}/supplier-payment`, fullData, getAuthConfig());
  return response.data as {
    success: boolean;
    message: string;
    data: {
      payment:      SupplierPayment;
      ledgerEntry:  LedgerEntry;
    };
  };
};

/**
 * Fetch payment history for a supplier
 */
export const fetchPaymentsBySupplier = async (
  supplierId: string,
  page  = 1,
  limit = 20,
  startDate?: string,
  endDate?:   string
) => {
  const params = new URLSearchParams({
    page:  String(page),
    limit: String(limit),
  });
  if (startDate) params.append("startDate", startDate);
  if (endDate)   params.append("endDate",   endDate);

  const response = await axios.get(
    `${BASE_URL}/supplier-payment/${supplierId}?${params.toString()}`,
     getAuthConfig()
  );

  return response.data as {
    success: boolean;
    data: {
      payments:   SupplierPayment[];
      totalPaid:  number;
      pagination: { total: number; page: number; limit: number; totalPages: number };
    };
  };
};

/**
 * Fetch payment summary for all suppliers
 */
export const fetchAllPaymentSummary = async () => {
  const response = await axios.get(`${BASE_URL}/supplier-payment/summary`, getAuthConfig());
  return response.data;
};