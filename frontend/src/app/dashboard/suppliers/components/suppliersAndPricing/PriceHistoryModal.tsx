// components/suppliersAndPricing/PriceHistoryModal.tsx
//
// ─── FIXES APPLIED ────────────────────────────────────────────────────────────
// ❌ item.changedAt      → ✅ item.createdAt       (timestamps: true se aata hai)
// ❌ item.effectivePrice → ✅ item.newPrice         (schema field)
// ❌ item.unitPrice      → ✅ item.newPrice         (same field)
// ❌ item.reason         → ✅ item.changeReason     (schema field)
// ❌ item.discount       → ✅ removed               (schema mein nahi hai)
// ❌ calculateChange()   → ✅ item.direction/change/changePercent use karo
//                           (backend controller already calculate karke bhejta hai)
// ─────────────────────────────────────────────────────────────────────────────

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, History, Calendar, TrendingUp, TrendingDown,
  Package, Download, User, FileText
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/form/CustomButton";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── TYPE — exactly what backend /supplier-price-history returns ──────────────
interface PriceRecord {
  _id:           string;
  productId:     string;
  supplierId:    string;
  sku:           string;
  newPrice:      number;         // ✅ actual cost price
  previousPrice: number | null;  // null = first ever entry
  currency:      string;
  source:        "manual" | "po" | "grn";
  changeReason:  string;         // ✅ not "reason"
  poNumber?:     string | null;
  grnNumber?:    string | null;
  changedBy?:    { email: string } | null;
  createdAt:     string;         // ✅ not "changedAt"
  // Pre-calculated by backend controller's enriched response:
  direction:     "up" | "down" | "same" | "new";
  change:        number | null;       // £ absolute difference
  changePercent: number | null;       // % difference
}

interface Props {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  supplierId:    string;
  productId:     string;
  productName:   string;
  sku:           string;
  currencySymbol: string;
}

const SOURCE_CONFIG: Record<string, { label: string; style: string }> = {
  manual: { label: "Manual Update",  style: "bg-violet-100 text-violet-700"  },
  po:     { label: "Purchase Order", style: "bg-blue-100 text-blue-700"      },
  grn:    { label: "GRN Invoice",    style: "bg-emerald-100 text-emerald-700" },
};

export function PriceHistoryModal({
  open, onOpenChange,
  supplierId, productId, productName, sku,
  currencySymbol,
}: Props) {
  const [history, setHistory] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (open && productId && supplierId) {
      fetchHistory();
    }
  }, [open, productId, supplierId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/supplier-price-history`, {
        params:  { supplierId, productId, limit: 50 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data?.data ?? []);
    } catch (err: any) {
      console.error("PriceHistoryModal fetch failed:", err);
      setError(err?.response?.data?.message || "Failed to load price history");
    } finally {
      setLoading(false);
    }
  };

  // ✅ createdAt — not changedAt
  const fmtDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };
  const fmtTime = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  // Sparkline
  const chartData = [...history].reverse();
  const prices    = chartData.map(r => r.newPrice);
  const minP      = prices.length ? Math.min(...prices) : 0;
  const maxP      = prices.length ? Math.max(...prices) : 1;
  const range     = maxP - minP || 1;
  const W = 500, H = 60;
  const px = (i: number) => prices.length === 1 ? W / 2 : (i / (prices.length - 1)) * W;
  const py = (p: number) => H - ((p - minP) / range) * H * 0.82 - 4;
  const polyline  = chartData.map((r, i) => `${px(i)},${py(r.newPrice)}`).join(" ");

  const current = history[0];
  const oldest  = history[history.length - 1];
  const overallPct = current && oldest && history.length > 1
    ? (((current.newPrice - oldest.newPrice) / oldest.newPrice) * 100).toFixed(1)
    : null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>

            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>

            {/* Modal */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{   opacity: 0, scale: 0.96, y: 16  }}
                transition={{ duration: 0.28, type: "spring", bounce: 0.22 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl z-50 outline-none"
                style={{ maxHeight: "90vh" }}
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>

                  {/* ── HEADER ───────────────────────────────────────────── */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600" />
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)," +
                          "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25) 0%, transparent 40%)",
                      }}
                    />

                    <div className="relative px-8 py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div
                            initial={{ rotate: -180, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                          >
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                              <History className="h-7 w-7 text-white" />
                            </div>
                          </motion.div>

                          <div>
                            <Dialog.Title className="text-2xl font-bold text-white">
                              Price History
                            </Dialog.Title>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-white/90 font-medium">{productName}</span>
                              <span className="text-white/40">·</span>
                              <span className="bg-white/20 text-white text-xs font-mono px-2 py-0.5 rounded-md border border-white/20">
                                {sku}
                              </span>
                              {overallPct !== null && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  parseFloat(overallPct) > 0
                                    ? "bg-red-400/30 text-red-100"
                                    : "bg-emerald-400/30 text-emerald-100"
                                }`}>
                                  {parseFloat(overallPct) > 0 ? "+" : ""}{overallPct}% overall
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Dialog.Close asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                          >
                            <X className="h-5 w-5 text-white" />
                          </motion.button>
                        </Dialog.Close>
                      </div>
                    </div>
                  </div>

                  {/* ── SCROLLABLE BODY ───────────────────────────────────── */}
                  <div className="flex-1 overflow-y-auto">

                    {/* Current Price Card */}
                    {current && (
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="px-8 pt-6"
                      >
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100 shadow-sm">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                                  Current Price
                                </p>
                                <div className="flex items-baseline gap-2">
                                  {/* ✅ newPrice */}
                                  <span className="text-4xl font-bold text-gray-900">
                                    ${currencySymbol}{current.newPrice.toFixed(2)}
                                  </span>
                                  <span className="text-gray-400 text-sm">{current.currency || "GBP"}</span>
                                </div>

                                {/* Previous + change */}
                                {current.previousPrice !== null && (
                                  <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-2">
                                    <span>Previous: <strong className="text-gray-700">${currencySymbol}{current.previousPrice.toFixed(2)}</strong></span>
                                    {current.change !== null && current.direction !== "same" && (
                                      <span className={`font-bold text-sm ${current.direction === "up" ? "text-red-500" : "text-emerald-600"}`}>
                                        {current.direction === "up" ? "▲ +" : "▼ "}
                                        4{currencySymbol}{Math.abs(current.change).toFixed(2)}
                                        {current.changePercent !== null && (
                                          <span className="text-xs ml-1 opacity-80">
                                            ({current.direction === "up" ? "+" : ""}{current.changePercent}%)
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </p>
                                )}
                                {current.direction === "new" && (
                                  <p className="text-xs text-gray-400 mt-1 italic">First price entry</p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-xs text-gray-400 mb-1">Last Updated</p>
                                {/* ✅ createdAt */}
                                <p className="text-sm font-semibold text-gray-700">
                                  {fmtDate(current.createdAt)}
                                </p>
                                <p className="text-xs text-gray-400">{fmtTime(current.createdAt)}</p>
                                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                  SOURCE_CONFIG[current.source]?.style || "bg-gray-100 text-gray-600"
                                }`}>
                                  {SOURCE_CONFIG[current.source]?.label || current.source}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Sparkline */}
                    {prices.length >= 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="px-8 pt-4"
                      >
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              Price Trend
                            </span>
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>Low <strong className="text-gray-700">${currencySymbol}{minP.toFixed(2)}</strong></span>
                              <span>High <strong className="text-gray-700">${currencySymbol}{maxP.toFixed(2)}</strong></span>
                            </div>
                          </div>
                          <svg viewBox={`0 0 ${W} ${H + 10}`} className="w-full" style={{ height: 72 }}>
                            <defs>
                              <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.01" />
                              </linearGradient>
                            </defs>
                            {[0, 0.5, 1].map(t => (
                              <line key={t}
                                x1="0" y1={py(minP + range * t)}
                                x2={W} y2={py(minP + range * t)}
                                stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3"
                              />
                            ))}
                            <polygon
                              points={`0,${H} ${polyline} ${W},${H}`}
                              fill="url(#sparkFill)"
                            />
                            <polyline
                              points={polyline}
                              fill="none" stroke="#8b5cf6" strokeWidth="2.5"
                              strokeLinecap="round" strokeLinejoin="round"
                            />
                            {chartData.map((r, i) => (
                              <circle key={i}
                                cx={px(i)} cy={py(r.newPrice)} r="3.5"
                                fill="white" stroke="#8b5cf6" strokeWidth="2"
                              />
                            ))}
                          </svg>
                        </div>
                      </motion.div>
                    )}

                    {/* History Table */}
                    <div className="p-8 pt-5">
                      <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-500" />
                        Price Change History
                        {history.length > 0 && (
                          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                            {history.length} records
                          </span>
                        )}
                      </h4>

                      {/* Loading */}
                      {loading && (
                        <div className="flex items-center justify-center py-16">
                          <div className="flex items-center gap-3 bg-white rounded-2xl px-8 py-4 shadow-xl border">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent"
                            />
                            <span className="text-sm font-medium text-gray-600">Loading history…</span>
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {!loading && error && (
                        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-2xl border border-red-100">
                          <p className="text-sm font-semibold text-red-600 mb-1">{error}</p>
                          <p className="text-xs text-red-400">Check NEXT_PUBLIC_API_BASE_URL and Bearer token</p>
                        </div>
                      )}

                      {/* Empty */}
                      {!loading && !error && history.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200"
                        >
                          <motion.div
                            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1.08, 1] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                            className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4"
                          >
                            <History className="h-8 w-8 text-gray-400" />
                          </motion.div>
                          <h5 className="text-base font-semibold text-gray-600 mb-1">No Price History</h5>
                          <p className="text-sm text-gray-400">No price changes have been recorded yet.</p>
                        </motion.div>
                      )}

                      {/* Table */}
                      {!loading && !error && history.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full">
                              <thead className="sticky top-0 z-10">
                                <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                                  <th className="px-5 py-3.5 text-left">
                                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                                      <Calendar className="h-3.5 w-3.5" /> Date
                                    </span>
                                  </th>
                                  <th className="px-5 py-3.5 text-right">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">New Price</span>
                                  </th>
                                  <th className="px-5 py-3.5 text-right">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Previous</span>
                                  </th>
                                  <th className="px-5 py-3.5 text-center">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Change</span>
                                  </th>
                                  <th className="px-5 py-3.5 text-left">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Source</span>
                                  </th>
                                  <th className="px-5 py-3.5 text-left">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Reason / Ref</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {history.map((item, index) => (
                                  <motion.tr
                                    key={item._id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ backgroundColor: "rgba(139, 92, 246, 0.04)" }}
                                    className={`group cursor-default ${index === 0 ? "bg-indigo-50/30" : ""}`}
                                  >
                                    {/* Date ✅ createdAt */}
                                    <td className="px-5 py-3.5">
                                      <div className="flex items-center gap-2">
                                        <motion.div
                                          whileHover={{ rotate: 360 }}
                                          transition={{ duration: 0.4 }}
                                          className="p-1.5 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors shrink-0"
                                        >
                                          <Calendar className="h-3.5 w-3.5 text-purple-700" />
                                        </motion.div>
                                        <div>
                                          <p className="text-sm text-gray-700">{fmtDate(item.createdAt)}</p>
                                          <p className="text-xs text-gray-400">{fmtTime(item.createdAt)}</p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* New Price ✅ newPrice */}
                                    <td className="px-5 py-3.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {index === 0 && (
                                          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold">
                                            NOW
                                          </span>
                                        )}
                                        <span className="font-bold text-gray-900 font-mono">
                                          ${currencySymbol}{item.newPrice.toFixed(2)}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Previous Price ✅ previousPrice */}
                                    <td className="px-5 py-3.5 text-right">
                                      {item.previousPrice !== null ? (
                                        <span className="text-sm text-gray-500 font-mono">
                                          ${currencySymbol}{item.previousPrice.toFixed(2)}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-300 italic">first entry</span>
                                      )}
                                    </td>

                                    {/* Change ✅ direction + changePercent (pre-calculated by backend) */}
                                    <td className="px-5 py-3.5 text-center">
                                      {item.direction === "new" || item.direction === "same" ? (
                                        <span className="text-gray-300 text-sm">—</span>
                                      ) : (
                                        <motion.span
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: "spring", delay: index * 0.04 }}
                                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                                            item.direction === "up"
                                              ? "bg-red-100 text-red-700"
                                              : "bg-emerald-100 text-emerald-700"
                                          }`}
                                        >
                                          {item.direction === "up"
                                            ? <TrendingUp   className="h-3 w-3" />
                                            : <TrendingDown className="h-3 w-3" />
                                          }
                                          {item.direction === "up" ? "+" : "-"}
                                          {item.changePercent !== null
                                            ? `${Math.abs(item.changePercent)}%`
                                            : ""
                                          }
                                        </motion.span>
                                      )}
                                    </td>

                                    {/* Source ✅ source */}
                                    <td className="px-5 py-3.5">
                                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                                        SOURCE_CONFIG[item.source]?.style || "bg-gray-100 text-gray-600"
                                      }`}>
                                        {SOURCE_CONFIG[item.source]?.label || item.source}
                                      </span>
                                    </td>

                                    {/* Reason ✅ changeReason, poNumber, grnNumber, changedBy */}
                                    <td className="px-5 py-3.5">
                                      <div className="space-y-1">
                                        {item.changeReason && (
                                          <p className="text-xs text-gray-600 flex items-start gap-1">
                                            <FileText className="h-3 w-3 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2 max-w-[200px]">
                                              {item.changeReason}
                                            </span>
                                          </p>
                                        )}
                                        <div className="flex flex-wrap gap-1">
                                          {item.poNumber && (
                                            <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                              PO: {item.poNumber}
                                            </span>
                                          )}
                                          {item.grnNumber && (
                                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                                              GRN: {item.grnNumber}
                                            </span>
                                          )}
                                          {item.changedBy?.email && (
                                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                              <User className="h-2.5 w-2.5" />
                                              {item.changedBy.email}
                                            </span>
                                          )}
                                        </div>
                                        {!item.changeReason && !item.poNumber && !item.grnNumber && (
                                          <span className="text-xs text-gray-300">—</span>
                                        )}
                                      </div>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* ── FOOTER ───────────────────────────────────────────── */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="shrink-0 px-8 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {loading
                          ? "Loading…"
                          : `${history.length} price ${history.length === 1 ? "change" : "changes"} recorded`
                        }
                      </p>
                      <div className="flex gap-3">
                        {/* Export CSV */}
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                          <Button
                            variant="outline"
                            disabled={!history.length}
                            onClick={() => {
                              const csv = [
                                ["Date", "New Price", "Previous Price", "Change %", "Direction", "Source", "Reason", "PO", "GRN", "Changed By"].join(","),
                                ...history.map(r => [
                                  fmtDate(r.createdAt),
                                  r.newPrice,
                                  r.previousPrice ?? "",
                                  r.changePercent ?? "",
                                  r.direction,
                                  r.source,
                                  `"${r.changeReason || ""}"`,
                                  r.poNumber  || "",
                                  r.grnNumber || "",
                                  r.changedBy?.email || "",
                                ].join(","))
                              ].join("\n");
                              const a = document.createElement("a");
                              a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
                              a.download = `price-history-${sku}.csv`;
                              a.click();
                            }}
                            className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <Download className="h-4 w-4" />
                            Export CSV
                          </Button>
                        </motion.div>

                        {/* Close */}
                        <Dialog.Close asChild>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg border-0 px-6">
                              Close
                            </Button>
                          </motion.div>
                        </Dialog.Close>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}