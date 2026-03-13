"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, AlertTriangle, TrendingDown, Package,
  RefreshCw, ArrowUpDown, X, ChevronRight,
  CheckCheck, Loader2, AlertOctagon, Bell,
  Clock, Truck, AlertCircle, CheckCircle2,
  Eye, EyeOff, Filter, Download, Printer,
  Zap, Flame, Droplet,
  Search
} from "lucide-react";
import { useStockAlerts, StockAlert } from "../../../../hooks/useStockAlerts";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = "severity" | "productName" | "currentStock" | "daysUntilStockout" | "suggestedOrderQty";
type SortDir = "asc" | "desc";

interface DashboardAlertPanelProps {
  userId: string;
  onCreatePOs?: () => void;
}

// ── Enhanced Severity Config with Gradients ──────────────────────────────────

const SEVERITY_CONFIG = {
  critical: {
    Icon: ShieldAlert,
    label: "Critical",
    gradient: "from-rose-600 to-red-600",
    lightGradient: "from-rose-50 to-red-50",
    border: "border-red-200",
    text: "text-red-600",
    darkText: "text-red-700",
    badge: "bg-red-500",
    badgeLight: "bg-red-100",
    barColor: "bg-gradient-to-r from-red-500 to-rose-500",
    glow: "shadow-red-200",
    iconBg: "bg-gradient-to-br from-red-400 to-rose-500",
    hoverGradient: "hover:from-red-600 hover:to-rose-600",
    dot: "bg-red-500",
    order: 0,
    description: "Below safety stock - Immediate action required",
  },
  warning: {
    Icon: AlertTriangle,
    label: "Warning",
    gradient: "from-orange-500 to-amber-500",
    lightGradient: "from-orange-50 to-amber-50",
    border: "border-orange-200",
    text: "text-orange-600",
    darkText: "text-orange-700",
    badge: "bg-orange-500",
    badgeLight: "bg-orange-100",
    barColor: "bg-gradient-to-r from-orange-500 to-amber-500",
    glow: "shadow-orange-200",
    iconBg: "bg-gradient-to-br from-orange-400 to-amber-500",
    hoverGradient: "hover:from-orange-600 hover:to-amber-600",
    dot: "bg-orange-500",
    order: 1,
    description: "At reorder point - Plan your purchase",
  },
  low: {
    Icon: TrendingDown,
    label: "Low Stock",
    gradient: "from-amber-500 to-yellow-500",
    lightGradient: "from-amber-50 to-yellow-50",
    border: "border-amber-200",
    text: "text-amber-600",
    darkText: "text-amber-700",
    badge: "bg-amber-500",
    badgeLight: "bg-amber-100",
    barColor: "bg-gradient-to-r from-amber-500 to-yellow-500",
    glow: "shadow-amber-200",
    iconBg: "bg-gradient-to-br from-amber-400 to-yellow-500",
    hoverGradient: "hover:from-amber-600 hover:to-yellow-600",
    dot: "bg-amber-500",
    order: 2,
    description: "Running low - Monitor closely",
  },
} as const;

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  warning: 1,
  low: 2,
};

function timeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

// ─────────────────────────────────────────────────────────────────────────────

interface SortButtonProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}

function SortButton({ field, label, sortField, sortDir, onSort }: SortButtonProps) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`group flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
        active
          ? "text-indigo-600"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {label}
      <ArrowUpDown
        className={`h-3.5 w-3.5 transition-colors ${
          active ? "text-indigo-600" : "text-gray-300 group-hover:text-gray-500"
        }`}
      />
    </button>
  );
}

export function DashboardAlertPanel({ userId, onCreatePOs }: DashboardAlertPanelProps) {
  const [sortField, setSortField] = useState<SortField>("severity");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "low">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    alerts,
    isLoading,
    count,
    criticalCount,
    warningCount,
    lowCount,
    fetchAlerts,
    dismissAlert,
    refetchCount,
  } = useStockAlerts({ userId, autoFetch: true });

  // Filter and search
  const filteredAlerts = alerts
    .filter(a => filter === "all" || a.severity === filter)
    .filter(a => 
      searchTerm === "" ||
      a.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Sort
  const sorted = [...filteredAlerts].sort((a, b) => {
    let valA: any, valB: any;
    if (sortField === "severity") {
      valA = SEVERITY_ORDER[a.severity];
      valB = SEVERITY_ORDER[b.severity];
    } else if (sortField === "currentStock") {
      valA = a.currentStock;
      valB = b.currentStock;
    } else if (sortField === "daysUntilStockout") {
      valA = a.daysUntilStockout ?? 9999;
      valB = b.daysUntilStockout ?? 9999;
    } else if (sortField === "suggestedOrderQty") {
      valA = a.suggestedOrderQty;
      valB = b.suggestedOrderQty;
    } else {
      valA = a.productName.toLowerCase();
      valB = b.productName.toLowerCase();
    }
    
    const compare = valA < valB ? -1 : valA > valB ? 1 : 0;
    return sortDir === "asc" ? compare : -compare;
  });

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  if (isLoading && alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bell className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-600">Scanning inventory levels...</p>
        <p className="text-sm text-gray-400">This will just take a moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <AlertOctagon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Stock Alerts</h1>
                <p className="text-indigo-200 text-sm mt-1">
                  Monitor and manage inventory levels in real-time
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { refetchCount(); fetchAlerts(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
            
            {count > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCreatePOs}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30"
              >
                <Package className="h-4 w-4" />
                <span>Create Purchase Orders</span>
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {(["critical", "warning", "low"] as const).map((severity) => {
            const config = SEVERITY_CONFIG[severity];
            const Icon = config.Icon;
            const statCount = severity === "critical" ? criticalCount : severity === "warning" ? warningCount : lowCount;
            
            return (
              <motion.button
                key={severity}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(f => f === severity ? "all" : severity)}
                className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all ${
                  filter === severity
                    ? `bg-gradient-to-br ${config.gradient} text-white shadow-xl scale-[1.02]`
                    : `bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20`
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      filter === severity
                        ? "bg-white/20"
                        : `bg-gradient-to-br ${config.lightGradient}`
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        filter === severity ? "text-white" : config.text
                      }`} />
                    </div>
                    
                    {filter === severity && (
                      <span className="px-2 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Active Filter
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-3xl font-black mb-1 ${
                    filter === severity ? "text-white" : config.darkText
                  }`}>
                    {statCount}
                  </p>
                  <p className={`text-sm font-semibold ${
                    filter === severity ? "text-white/90" : "text-gray-700"
                  }`}>
                    {config.label}
                  </p>
                  <p className={`text-xs mt-1 ${
                    filter === severity ? "text-white/70" : "text-gray-500"
                  }`}>
                    {config.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product, SKU, or supplier..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all"
          />
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "table"
                ? "bg-white shadow-md text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "cards"
                ? "bg-white shadow-md text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* No Alerts State */}
      {alerts.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border border-emerald-100"
        >
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-400 flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">All Stock Levels Healthy</h3>
          <p className="text-gray-500 text-center max-w-md">
            No products require restocking at this time. Your inventory is well maintained.
          </p>
          <button
            onClick={() => fetchAlerts()}
            className="mt-8 px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold border border-emerald-200 hover:bg-emerald-50 transition-colors"
          >
            Check Again
          </button>
        </motion.div>
      )}

      {/* Active Filter Bar */}
      {filter !== "all" && sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
        >
          <span className="text-sm text-indigo-700 font-medium">
            <span className="font-bold">{sorted.length}</span> {filter} alerts showing
            {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
          </span>
          <button
            onClick={() => {
              setFilter("all");
              setSearchTerm("");
            }}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 bg-white rounded-lg shadow-sm"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </button>
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === "table" && sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <SortButton field="productName" label="Product" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <SortButton field="severity" label="Severity" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <SortButton field="currentStock" label="Stock Level" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <SortButton field="daysUntilStockout" label="Time Left" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <SortButton field="suggestedOrderQty" label="Order Qty" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-right">
              Actions
            </span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {sorted.map((alert, index) => (
                <AlertTableRow
                  key={alert._id}
                  alert={alert}
                  index={index}
                  onDismiss={dismissAlert}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Card View */}
      {viewMode === "cards" && sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {sorted.map((alert, index) => (
              <AlertCard
                key={alert._id}
                alert={alert}
                index={index}
                onDismiss={dismissAlert}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Enhanced Table Row ─────────────────────────────────────────────────────

function AlertTableRow({
  alert,
  index,
  onDismiss,
}: {
  alert: StockAlert;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.Icon;
  
  const stockPercentage = Math.min(
    100,
    alert.reorderPoint > 0
      ? (alert.currentStock / alert.reorderPoint) * 100
      : 50
  );

  const timeStatus =
    alert.daysUntilStockout == null ? "unknown" :
    alert.daysUntilStockout <= 2 ? "critical" :
    alert.daysUntilStockout <= 7 ? "warning" : "healthy";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 px-6 py-4 items-center hover:bg-gradient-to-r ${config.lightGradient} transition-all group`}
    >
      {/* Product Info */}
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 truncate flex items-center gap-2">
          {alert.productName}
          {alert.severity === "critical" && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full animate-pulse">
              URGENT
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 font-mono">{alert.sku}</p>
        {alert.supplierName && (
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            {alert.supplierName}
          </p>
        )}
      </div>

      {/* Severity Badge */}
      <div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </span>
      </div>

      {/* Stock Level */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-lg font-bold ${config.text}`}>
            {alert.currentStock}
          </span>
          <span className="text-xs text-gray-400">
            / {alert.reorderPoint}
          </span>
        </div>
        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stockPercentage}%` }}
            className={`h-full rounded-full bg-gradient-to-r ${
              alert.severity === "critical" ? "from-red-500 to-rose-500" :
              alert.severity === "warning" ? "from-orange-500 to-amber-500" :
              "from-amber-500 to-yellow-500"
            }`}
          />
        </div>
      </div>

      {/* Time Left */}
      <div>
        {alert.daysUntilStockout != null ? (
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${
              timeStatus === "critical" ? "text-red-500" :
              timeStatus === "warning" ? "text-orange-500" :
              "text-gray-400"
            }`} />
            <span className={`font-semibold ${
              timeStatus === "critical" ? "text-red-600" :
              timeStatus === "warning" ? "text-orange-600" :
              "text-gray-600"
            }`}>
              {alert.daysUntilStockout}d
            </span>
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </div>

      {/* Order Quantity */}
      <div>
        <span className="text-lg font-bold text-indigo-600">
          {alert.suggestedOrderQty}
        </span>
        <p className="text-[10px] text-gray-400">units</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDismiss(alert._id)}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-all"
          title="Dismiss Alert"
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Card View Component ───────────────────────────────────────────────────

function AlertCard({
  alert,
  index,
  onDismiss,
}: {
  alert: StockAlert;
  index: number;
  onDismiss: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl border ${config.border} bg-white shadow-lg hover:shadow-xl transition-all`}
    >
      {/* Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{alert.productName}</h3>
              <p className="text-xs text-gray-500 font-mono">{alert.sku}</p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(alert._id)}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Current Stock</p>
            <p className={`text-xl font-bold ${config.text}`}>{alert.currentStock}</p>
            <p className="text-[10px] text-gray-400">min: {alert.reorderPoint}</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Order Quantity</p>
            <p className="text-xl font-bold text-indigo-600">{alert.suggestedOrderQty}</p>
            <p className="text-[10px] text-gray-400">suggested</p>
          </div>
        </div>

        {/* Time Left */}
        {alert.daysUntilStockout != null && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl mb-3">
            <span className="text-xs font-medium text-gray-600">Est. stockout in</span>
            <span className={`font-bold ${
              alert.daysUntilStockout <= 2 ? "text-red-600" :
              alert.daysUntilStockout <= 7 ? "text-orange-600" :
              "text-amber-600"
            }`}>
              {alert.daysUntilStockout} days
            </span>
          </div>
        )}

        {/* Supplier Info */}
        {alert.supplierName && (
          <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <Truck className="h-3 w-3" />
            <span className="truncate">{alert.supplierName}</span>
          </div>
        )}

        {/* Time Ago */}
        <p className="text-[10px] text-gray-400 mt-2">
          {timeAgo(alert.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}