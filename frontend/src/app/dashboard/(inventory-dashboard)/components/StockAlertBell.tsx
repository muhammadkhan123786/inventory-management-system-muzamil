"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bell, ShieldAlert, AlertTriangle, TrendingDown,
  X, RefreshCw, Package, ArrowRight, CheckCheck, 
  Loader2, AlertCircle, Clock, Truck, Zap
} from "lucide-react";
import { useStockAlerts, StockAlert } from "@/hooks/useStockAlerts";

interface StockAlertBellProps {
  userId: string;
  poPath?: string;
}

const SEVERITY_CONFIG = {
  critical: {
    Icon: ShieldAlert,
    gradient: "from-red-600 to-rose-600",
    lightBg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    badge: "bg-red-500",
    label: "Critical",
  },
  warning: {
    Icon: AlertTriangle,
    gradient: "from-orange-500 to-amber-500",
    lightBg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    badge: "bg-orange-500",
    label: "Warning",
  },
  low: {
    Icon: TrendingDown,
    gradient: "from-amber-500 to-yellow-500",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    badge: "bg-amber-500",
    label: "Low",
  },
} as const;

export function StockAlertBell({ 
  userId, 
  poPath = "/alerts" 
}: StockAlertBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    count,
    hasNewAlert,
    alerts,
    isLoading,
    error,
    fetchAlerts,
    dismissAlert,
    refetchCount,
    criticalCount,
  } = useStockAlerts({ userId, pollIntervalMs: 30000 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      fetchAlerts();
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, fetchAlerts]);

  const getHeaderGradient = () => {
    if (error) return "from-red-600 to-rose-600";
    if (criticalCount > 0) return "from-red-600 to-rose-600";
    if (count > 0) return "from-orange-500 to-amber-500";
    return "from-slate-800 to-slate-900";
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className={`relative h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
          open
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
            : error
            ? "bg-gradient-to-br from-red-500 to-rose-600 text-white"
            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
        }`}
      >
        {/* Pulse Animation for New Alerts */}
        <AnimatePresence>
          {hasNewAlert && (
            <motion.span
              className="absolute inset-0 rounded-xl bg-red-400/30"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {error ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <>
            <motion.div
              animate={hasNewAlert ? {
                rotate: [0, -15, 15, -10, 10, 0],
                transition: { duration: 0.5 }
              } : {}}
            >
              <Bell className="h-5 w-5" />
            </motion.div>

            {/* Count Badge */}
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -top-1 -right-1 h-6 min-w-[24px] px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-lg ${
                  criticalCount > 0
                    ? "bg-gradient-to-r from-red-500 to-rose-500"
                    : "bg-gradient-to-r from-orange-500 to-amber-500"
                }`}
              >
                {count > 99 ? "99+" : count}
              </motion.span>
            )}
          </>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.2 }}
            className="absolute right-0 top-14 w-[420px] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getHeaderGradient()} px-5 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Stock Alerts</h3>
                    <p className="text-white/80 text-xs mt-0.5">
                      {error
                        ? "Failed to load alerts"
                        : count === 0
                        ? "All stock levels healthy"
                        : `${count} pending alert${count !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      refetchCount();
                      fetchAlerts();
                    }}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Mini Stats */}
              {!error && count > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  {criticalCount > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-lg">
                      <Zap className="h-3 w-3 text-white" />
                      <span className="text-xs font-bold text-white">{criticalCount} critical</span>
                    </div>
                  )}
                  {/* {warningCount > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 rounded-lg">
                      <AlertTriangle className="h-3 w-3 text-white" />
                      <span className="text-xs font-bold text-white">{warningCount} warning</span>
                    </div>
                  )} */}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {error ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <AlertCircle className="h-12 w-12 text-red-300 mb-3" />
                  <p className="text-sm font-semibold text-gray-700">Failed to load alerts</p>
                  <p className="text-xs text-gray-400 text-center mt-1">{error}</p>
                  <button
                    onClick={() => {
                      refetchCount();
                      fetchAlerts();
                    }}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm rounded-xl hover:from-indigo-700 hover:to-purple-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-500">Loading alerts...</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center mb-4 shadow-lg">
                    <CheckCheck className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-base font-semibold text-gray-700">All Clear!</p>
                  <p className="text-sm text-gray-400 mt-1">No stock alerts at this time</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {alerts.slice(0, 5).map((alert) => (
                      <AlertDropdownRow
                        key={alert._id}
                        alert={alert}
                        onDismiss={dismissAlert}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {alerts.length > 5 && (
                    <div className="px-4 py-2 bg-gray-50 text-center">
                      <p className="text-xs text-gray-500">
                        +{alerts.length - 5} more alerts
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!error && alerts.length > 0 && (
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setOpen(false);
                    router.push(poPath);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
                >
                  <Package className="h-4 w-4" />
                  View All Alerts
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dropdown Row Component
function AlertDropdownRow({
  alert,
  onDismiss,
}: {
  alert: StockAlert;
  onDismiss: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`px-4 py-3 ${config.lightBg} hover:bg-white transition-all group cursor-pointer`}
      onClick={() => {
        // Optional: Navigate to product details
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shrink-0`}>
          <Icon className="h-4 w-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {alert.productName}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{alert.sku}</p>
            </div>
            <span className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${config.gradient}`}>
              {config.label}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-600">
                Stock: <span className="font-bold">{alert.currentStock}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {alert.daysUntilStockout ? `${alert.daysUntilStockout}d left` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Supplier */}
          {alert.supplierName && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Truck className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500 truncate">{alert.supplierName}</span>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(alert._id);
          }}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}