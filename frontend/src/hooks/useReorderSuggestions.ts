// hooks/useReorderSuggestions.ts
"use client";

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface ReorderProduct {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  maxStockLevel: number;
  suggestedQty: number;
  costPrice: number;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  daysUntilStockout?: number;
  severity: "critical" | "warning" | "low";
  alertId?: string;
}

interface ApiReorderSuggestion {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  maxStockLevel: number;
  suggestedOrderQty: number;
  unitPrice: number;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  daysUntilStockout?: number;
  severity: "critical" | "warning" | "low";
  alertId?: string;
}

function toReorderProduct(s: ApiReorderSuggestion): ReorderProduct {
  return {
    productId: s.productId,
    productName: s.productName,
    sku: s.sku,
    currentStock: s.currentStock,
    reorderPoint: s.reorderPoint,
    safetyStock: s.safetyStock,
    maxStockLevel: s.maxStockLevel,
    suggestedQty: s.suggestedOrderQty,
    costPrice: s.unitPrice,
    supplierId: s.supplierId,
    supplierName: s.supplierName,
    supplierEmail: s.supplierEmail,
    daysUntilStockout: s.daysUntilStockout,
    severity: s.severity,
    alertId: s.alertId,
  };
}

interface UseReorderSuggestionsOptions {
  userId: string;
  createAlerts?: boolean;
  sendEmails?: boolean;
  autoFetch?: boolean;
}

export function useReorderSuggestions({ 
  userId, 
  createAlerts = true, 
  sendEmails = false,
  autoFetch = false 
}: UseReorderSuggestionsOptions) {
  const [reorderProducts, setReorderProducts] = useState<ReorderProduct[]>([]);
  const [isFetchingReorder, setIsFetchingReorder] = useState(false);
  const [reorderFetched, setReorderFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

  const fetchReorderSuggestions = useCallback(async (forceRefresh = false) => {
const token = localStorage.getItem('token');
    if (!userId) {

      toast.error("userId is required to load reorder suggestions.");
      return;
    }

    
    if (isFetchingReorder) return;
    if (reorderFetched && !forceRefresh) return;

    setIsFetchingReorder(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        createAlerts: String(createAlerts),
        sendEmails: String(sendEmails),
      });
    const res = await fetch(`${BASE_URL}/purchase-orders/reorder/suggestions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 2. Authorization header shamil karein
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load suggestions");

      const mapped: ReorderProduct[] = (data.suggestions ?? []).map(toReorderProduct);
      setReorderProducts(mapped);
      setReorderFetched(true);

      if (forceRefresh) {
        const counts = data.counts ?? {};
        toast.success(
          `Found ${mapped.length} product${mapped.length !== 1 ? "s" : ""} needing restock` +
          (counts.critical > 0 ? ` (${counts.critical} critical)` : ""),
          { duration: 3000 }
        );
      }

      return mapped;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message ?? "Could not load reorder suggestions");
      throw err;
    } finally {
      setIsFetchingReorder(false);
    }
  }, [userId, createAlerts, sendEmails, isFetchingReorder, reorderFetched, BASE_URL]);

  const resetReorderState = useCallback(() => {
    setReorderProducts([]);
    setReorderFetched(false);
    setError(null);
  }, []);

  // Auto-fetch if enabled
  useEffect(() => {
    if (autoFetch && userId && !reorderFetched && !isFetchingReorder) {
      fetchReorderSuggestions();
    }
  }, [autoFetch, userId, reorderFetched, isFetchingReorder, fetchReorderSuggestions]);

  return {
    reorderProducts,
    isFetchingReorder,
    reorderFetched,
    error,
    fetchReorderSuggestions,
    resetReorderState,
    setReorderProducts,
  };
}