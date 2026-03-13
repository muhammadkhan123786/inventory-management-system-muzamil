// ─────────────────────────────────────────────────────────────────────────────
//  SHARED TYPES — Supplier Ledger & Payment
//  Used in: backend controllers + frontend hook + components
//  Path (frontend): ../app/dashboard/(inventory-dashboard)/supplier-ledger/types/supplierLedger.ts
//  Path (backend):  src/types/supplierLedger.types.ts
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ─────────────────────────────────────────────────────────────────────

export type LedgerDirection  = "debit" | "credit";
export type LedgerEntryType  = "purchase" | "return" | "payment" | "adjustment";
export type LedgerRefType    = "GRN" | "GRTN" | "PAYMENT" | "MANUAL";
export type PaymentMethod    = "bank_transfer" | "cheque" | "cash" | "online";

// ── Supplier (minimal — matches your existing Supplier model) ─────────────────

export interface SupplierRef {
  _id:   string;
  name:  string;
  email?: string;
  phone?: string;
}

// ── GRN Reference (minimal) ───────────────────────────────────────────────────

export interface GRNRef {
  _id:         string;
  grnNumber:   string;
  totalAmount: number;
}

// ── Ledger Entry ──────────────────────────────────────────────────────────────

export interface LedgerEntry {
  _id:             string;
  supplierId:      string | SupplierRef;
  type:            LedgerEntryType;
  direction:       LedgerDirection;
  amount:          number;
  referenceType:   LedgerRefType;
  referenceId?:    string;
  referenceNumber?: string;
  balanceBefore:   number;
  balanceAfter:    number;
  date:            string;
  notes?:          string;
  createdBy?:      string;
  createdAt:       string;
  updatedAt:       string;
}

// ── Supplier Payment ──────────────────────────────────────────────────────────

export interface SupplierPayment {
  _id:             string;
  supplierId:      string | SupplierRef;
  amount:          number;
  paymentDate:     string;
  paymentMethod:   PaymentMethod;
  referenceNumber?: string;
  grnIds?:         string[] | GRNRef[];
  notes?:          string;
  createdBy?:      string;
  isDeleted?:      boolean;
  createdAt:       string;
  updatedAt:       string;
}

// ── Stats / Summary ───────────────────────────────────────────────────────────

export interface LedgerSummary {
  totalPurchases: number;   // Sum of all GRN debits
  totalReturns:   number;   // Sum of all GRTN credits
  totalPayments:  number;   // Sum of all payment credits
  totalDebit:     number;   // totalPurchases
  totalCredit:    number;   // totalReturns + totalPayments
  outstanding:    number;   // totalDebit - totalCredit
  entryCount:     number;
}

export interface SupplierBalance {
  supplierId:      string;
  supplierName:    string;
  supplierEmail?:  string;
  totalDebit:      number;
  totalCredit:     number;
  outstanding:     number;
  lastTransaction: string;
}

// ── DTOs (Create / Request payloads) ─────────────────────────────────────────

export interface CreatePaymentDto {
  userId?:string;
  supplierId:       string;
  amount:           number;
  paymentDate?:     string;
  paymentMethod:    PaymentMethod;
  referenceNumber?: string;
  grnIds?:          string[];
  notes?:           string;
  createdBy?:       string;
}

export interface CreateAdjustmentDto {
  supplierId:  string;
  amount:      number;
  direction:   LedgerDirection;
  notes:       string;
  createdBy?:  string;
}

// ── API Response wrappers ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data:    T;
}

export interface PaginatedResponse<T> {
  items:      T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

// ── Ledger query filters ──────────────────────────────────────────────────────

export interface LedgerFilters {
  type?:       LedgerEntryType | "all";
  direction?:  LedgerDirection | "all";
  startDate?:  string;
  endDate?:    string;
  page?:       number;
  limit?:      number;
}