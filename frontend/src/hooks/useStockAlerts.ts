// hooks/useStockAlerts.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export interface StockAlert {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  category?: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  maxStockLevel: number;
  suggestedOrderQty: number;
  averageDailySales?: number;
  daysUntilStockout?: number;
  supplierName: string;
  supplierEmail: string;
  severity: "critical" | "warning" | "low";
  status: "pending" | "ordered" | "resolved";
  createdAt: string;
}

interface UseStockAlertsOptions {
  userId: string;
  apiBase?: string;
  pollIntervalMs?: number;
  autoFetch?: boolean;
}

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};



export function useStockAlerts({
  userId,
  apiBase = `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchase-orders`,
  pollIntervalMs = 60000,
  autoFetch = false,
}: UseStockAlertsOptions) {
  const [count, setCount] = useState(0);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const prevCount = useRef(0);
  const pollTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Lightweight count poll
  const refetchCount = useCallback(async () => {
    if (!userId) {
      console.log("No userId provided");
      return;
    }

    try {
      const response = await axios.get(
        `${apiBase}/alerts/count`,
        {
          params: { userId },
          ...getAuthConfig(),
        }
      );

      const n: number = response.data.count ?? 0;
      
      // Check for new alerts
      if (n > prevCount.current) {
        setHasNewAlert(true);
        setTimeout(() => setHasNewAlert(false), 5000);
      }
      
      prevCount.current = n;
      setCount(n);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch alert count:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch count");
    }
  }, [userId, apiBase]);

  // Full list fetch
  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${apiBase}/alerts`,
        {
          params: { userId },
          ...getAuthConfig(),
        }
      );

      const list: StockAlert[] = response.data.alerts ?? [];
      setAlerts(list);
      setCount(list.length);
      prevCount.current = list.length;
      setError(null);
    } catch (err: any) {
      console.error(" alerts:", err.response?.data || err.message);
      setError(err.response?.data?.message || " alerts");
    } finally {
      setIsLoading(false);
    }
  }, [userId, apiBase]);

  // Start polling only when component mounts
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    refetchCount();

    // Set up polling
    pollTimerRef.current = setInterval(refetchCount, pollIntervalMs);

    // Cleanup
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [refetchCount, pollIntervalMs, userId]);

  // Auto-fetch full list if requested
  useEffect(() => {
    if (autoFetch && userId) {
      fetchAlerts();
    }
  }, [autoFetch, userId, fetchAlerts]);

  // Dismiss alert
  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      setAlerts(prev => prev.filter(a => a._id !== alertId));
      setCount(prev => Math.max(0, prev - 1));
      
      await axios.patch(
        `${apiBase}/alerts/${alertId}/dismiss`,
        {},
        getAuthConfig()
      );
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
      // Revert optimistic update on error
      fetchAlerts();
    }
  }, [apiBase, fetchAlerts]);

  
  return {
    count,
    hasNewAlert,
    alerts,
    isLoading,
    error,
    fetchAlerts,
    dismissAlert,
    refetchCount,
    criticalCount: alerts.filter(a => a.severity === "critical").length,
    warningCount: alerts.filter(a => a.severity === "warning").length,
    lowCount: alerts.filter(a => a.severity === "low").length,
  };
}