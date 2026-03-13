"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  useSupplierLedger — Custom Hook
//  Path: ../hooks/useSupplierLedger.ts
//  Pattern: Same as your useGoodsReturn hook
//    - Generation counter (no stale fetch overwrites)
//    - useCallback for fetch functions
//    - Single useEffect per concern (no duplicates)
//    - toast via sonner
//    - axios via helper functions
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import axios from "axios";
import {
  LedgerEntry,
  LedgerSummary,
  SupplierPayment,
  SupplierBalance,
  CreatePaymentDto,
  LedgerFilters,
  LedgerEntryType,
  LedgerDirection,
} from "@common/ISupplierledger.interface";
import {
  fetchLedgerBySupplier,
  fetchPaymentsBySupplier,
  fetchAllSupplierBalances,
  recordSupplierPayment,
} from "@/helper/supplierLedger";

interface UseSupplierLedgerOptions {
  supplierId?: string;
  autoFetch?:  boolean;
}

export const useSupplierLedger = (options: UseSupplierLedgerOptions = {}) => {
  const { supplierId, autoFetch = true } = options;

  // ── Core data ──────────────────────────────────────────────────────────────
  const [entries,  setEntries]  = useState<LedgerEntry[]>([]);
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [summary,  setSummary]  = useState<LedgerSummary>({
    totalPurchases: 0, totalReturns: 0, totalPayments: 0,
    totalDebit: 0, totalCredit: 0, outstanding: 0, entryCount: 0,
  });

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isLoading,        setIsLoading]        = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page,       setPage]       = useState(1);
  const [limit]                     = useState(50);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [typeFilter,      setTypeFilter]      = useState<LedgerEntryType | "all">("all");
  const [directionFilter, setDirectionFilter] = useState<LedgerDirection | "all">("all");
  const [startDate,       setStartDate]       = useState("");
  const [endDate,         setEndDate]         = useState("");

  // ── Generation counters — same pattern as useGoodsReturn ──────────────────
  const fetchGenRef = useRef(0);
  const payGenRef   = useRef(0);

  // ── Load ledger entries ────────────────────────────────────────────────────
  const loadLedger = useCallback(async () => {
    if (!supplierId) return;

    const myGen = ++fetchGenRef.current;
    setIsLoading(true);

    try {
      const filters: LedgerFilters = {
        page, limit,
        type:      typeFilter,
        direction: directionFilter,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      };

      const res = await fetchLedgerBySupplier(supplierId, filters);

      if (myGen !== fetchGenRef.current) return; // stale — discard

      if (res.success) {
        setEntries(res.data.entries || []);
        setSummary(res.data.summary);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err: any) {
      if (myGen !== fetchGenRef.current) return;
      if (!axios.isCancel(err)) toast.error("Failed to load ledger entries");
    } finally {
      if (myGen === fetchGenRef.current) setIsLoading(false);
    }
  }, [supplierId, page, limit, typeFilter, directionFilter, startDate, endDate]);

  // ── Load payments ──────────────────────────────────────────────────────────
  const loadPayments = useCallback(async () => {
    if (!supplierId) return;

    const myGen = ++payGenRef.current;

    try {
      const res = await fetchPaymentsBySupplier(supplierId, 1, 100);
      if (myGen !== payGenRef.current) return;
      if (res.success) setPayments(res.data.payments || []);
    } catch (err: any) {
      if (myGen !== payGenRef.current) return;
      console.error("[useSupplierLedger] loadPayments:", err.message);
    }
  }, [supplierId]);

  // ── Single effects — useCallback handles dependency changes ────────────────
  useEffect(() => { if (autoFetch) loadLedger();  }, [loadLedger,  autoFetch]);
  useEffect(() => { if (autoFetch) loadPayments(); }, [loadPayments, autoFetch]);

  // ── Record payment ─────────────────────────────────────────────────────────
  const handleRecordPayment = useCallback(
    async (data: CreatePaymentDto): Promise<{ success: boolean; message: string }> => {
      setIsPaymentLoading(true);
      try {
        const res = await recordSupplierPayment(data);
        if (!res.success) throw new Error(res.message || "Failed");

        toast.success("Payment recorded — ledger updated");
        setTimeout(() => { loadLedger(); loadPayments(); }, 400);

        return { success: true, message: res.message };
      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message || "Failed to record payment";
        toast.error(msg);
        return { success: false, message: msg };
      } finally {
        setIsPaymentLoading(false);
      }
    },
    [loadLedger, loadPayments]
  );

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchType = typeFilter === "all" || e.type === typeFilter;
      const matchDir  = directionFilter === "all" || e.direction === directionFilter;
      return matchType && matchDir;
    });
  }, [entries, typeFilter, directionFilter]);

  const refresh      = useCallback(() => { loadLedger(); loadPayments(); }, [loadLedger, loadPayments]);
  const resetFilters = useCallback(() => {
    setTypeFilter("all"); setDirectionFilter("all");
    setStartDate(""); setEndDate(""); setPage(1);
  }, []);

  return {
    entries, filteredEntries, payments, summary,
    isLoading, isPaymentLoading,
    page, setPage, limit, total, totalPages,
    typeFilter, setTypeFilter,
    directionFilter, setDirectionFilter,
    startDate, setStartDate,
    endDate,   setEndDate,
    handleRecordPayment, refresh, resetFilters,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
//  useAllSupplierBalances — for dashboard
// ─────────────────────────────────────────────────────────────────────────────

export const useAllSupplierBalances = () => {
  const [balances,         setBalances]         = useState<SupplierBalance[]>([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [isLoading,        setIsLoading]        = useState(false);
  const genRef = useRef(0);

  const load = useCallback(async () => {
    const myGen = ++genRef.current;
    setIsLoading(true);
    try {
      const res = await fetchAllSupplierBalances();
      if (myGen !== genRef.current) return;
      if (res.success) {
        setBalances(res.data.suppliers || []);
        setTotalOutstanding(res.data.totalOutstanding || 0);
      }
    } catch { if (myGen !== genRef.current) return; toast.error("Failed to load balances"); }
    finally  { if (myGen === genRef.current) setIsLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { balances, totalOutstanding, isLoading, refresh: load };
};