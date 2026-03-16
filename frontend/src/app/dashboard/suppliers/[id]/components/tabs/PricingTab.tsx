// components/suppliersAndPricing/SupplierPricingTab.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/form/Input";
import {
  Loader2, Search, TrendingUp, TrendingDown, Minus,
  History, Edit, Package, DollarSign, AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { PriceHistoryModal } from "../../../components/suppliersAndPricing/PriceHistoryModal";
import { UpdatePriceModal } from "../../../components/suppliersAndPricing/UpdatePriceModal";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ProductRow {
  productId: string;
  productName: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  retailPrice: number;
  leadTimeDays: number;
  stockQty: number;
  lastChange?: {
    direction: "up" | "down" | "same" | "new";
    change: number | null;
    changedAt: string;
  };
}

interface Props {
  supplierId: string;
  supplierName: string;
  userId: string;
  currencySymbol: string;
}

const DirIcon = ({ dir }: { dir: string }) => {
  if (dir === "up") return <TrendingUp className="h-3.5 w-3.5 text-red-500" />;
  if (dir === "down") return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
};

export function SupplierPricingTab({ supplierId, supplierName, userId, currencySymbol }: Props) {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [updateModal, setUpdateModal] = useState<{ open: boolean; row: ProductRow | null }>({ open: false, row: null });
  const [historyModal, setHistoryModal] = useState<{ open: boolean; row: ProductRow | null }>({ open: false, row: null });

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/products`, {
        headers: authHeader(),
      });

      const allProducts: any[] = Array.isArray(res.data)
        ? res.data
        : (res.data?.data ?? []);

      const mapped: ProductRow[] = [];
      for (const p of allProducts) {
        for (const attr of p.attributes || []) {
          if (String(attr.stock?.supplierId) !== String(supplierId)) continue;
          const pricing = attr.pricing?.[0];
          mapped.push({
            productId: String(p._id),
            productName: p.productName || p.name || "Unknown",
            sku: attr.sku || p.sku || "",
            costPrice: pricing?.costPrice ?? 0,
            sellingPrice: pricing?.sellingPrice ?? 0,
            retailPrice: pricing?.retailPrice ?? 0,
            leadTimeDays: attr.stock?.leadTimeDays ?? 0,
            stockQty: attr.stock?.stockQuantity ?? 0,
          });
        }
      }

      const withHistory = await Promise.all(
        mapped.map(async (row) => {
          try {
            const hRes = await axios.get(`${BASE_URL}/supplier-price-history`, {
              params: { supplierId, productId: row.productId, limit: 1 },
              headers: authHeader(),
            });
            const latest = hRes.data?.data?.[0];
            if (latest) return { ...row, lastChange: { direction: latest.direction, change: latest.change, changedAt: latest.createdAt } };
          } catch { /* ignore */ }
          return row;
        })
      );

      setRows(withHistory);
    } catch (err) {
      console.error("SupplierPricingTab fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const filtered = rows.filter(r =>
    !search ||
    r.productName.toLowerCase().includes(search.toLowerCase()) ||
    r.sku.toLowerCase().includes(search.toLowerCase())
  );

  const margin = (row: ProductRow) =>
    row.sellingPrice > 0
      ? ((row.sellingPrice - row.costPrice) / row.sellingPrice * 100).toFixed(1)
      : "0.0";

  const avgMargin = rows.length
    ? (rows.reduce((s, r) => s + parseFloat(margin(r)), 0) / rows.length).toFixed(1)
    : "0.0";

  const lowStockCount = rows.filter(r => r.stockQty < 10).length;
  const totalValue = rows.reduce((s, r) => s + r.costPrice * r.stockQty, 0);

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { text: "Out of stock", class: "text-red-600 bg-red-50" };
    if (qty < 10) return { text: "Low stock", class: "text-amber-600 bg-amber-50" };
    return { text: `${qty} in stock`, class: "text-gray-600 bg-gray-50" };
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading products…</span>
    </div>
  );

  return (
    <>
      {/* Stats bar */}
      {rows.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: Package, label: "Total Products", value: String(rows.length), grad: "from-blue-50 to-indigo-50 border-blue-200 text-blue-800" },
            { icon: DollarSign, label: "Avg Margin", value: `${avgMargin}%`, grad: "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800" },
            { icon: TrendingUp, label: "Stock Value", value: `${currencySymbol}${totalValue.toFixed(0)}`, grad: "from-violet-50 to-purple-50 border-violet-200 text-violet-800" },
            { icon: AlertTriangle, label: "Low Stock", value: String(lowStockCount), grad: "from-amber-50 to-orange-50 border-amber-200 text-amber-800" },
          ].map(({ icon: Icon, label, value, grad }) => (
            <div key={label} className={`rounded-2xl p-4 border bg-gradient-to-br ${grad}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/60 rounded-xl">
                  <Icon className="h-4 w-4 opacity-70" />
                </div>
                <div>
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{label}</p>
                  <p className="font-bold text-lg leading-tight">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header with title and search */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Products & Pricing ({rows.length})</h3>
          <p className="text-xs text-gray-400 mt-0.5">Linked via product variant supplier</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search product or SKU..."
            className="pl-9 h-9 text-sm bg-white border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-xl"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
          <Package className="h-12 w-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">
            {rows.length === 0 ? "No products linked to this supplier" : "No matching products found"}
          </p>
          {rows.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">Link supplier via Product → Edit → Attributes → Stock → Supplier</p>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          {/* Table Header - Fixed column widths matching design */}
          <div className="grid grid-cols-12 gap-2 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200 px-6 py-3">
            <div className="col-span-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">Product</div>
            <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">SKU</div>
            <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Cost Price</div>
            <div className="col-span-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">Selling</div>
            <div className="col-span-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">Margin</div>
            <div className="col-span-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">Stock</div>
            <div className="col-span-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {filtered.map(row => {
              const m = parseFloat(margin(row));
              const stockStatus = getStockStatus(row.stockQty);
              
              return (
                <div
                  key={`${row.productId}-${row.sku}`}
                  className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-indigo-50/20 transition-colors"
                >
                  {/* Product - col-span-3 */}
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-gray-900 truncate pr-2" title={row.productName}>
                      {row.productName}
                    </p>
                    {row.leadTimeDays > 0 && (
                      <p className="text-xs text-gray-400 mt-1">Lead: {row.leadTimeDays}d</p>
                    )}
                  </div>

                  {/* SKU - col-span-2 */}
                  <div className="col-span-2">
                    <span className="inline-block text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      {row.sku}
                    </span>
                  </div>

                  {/* Cost Price - col-span-2 */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900">${currencySymbol}{row.costPrice.toFixed(2)}</span>
                      {row.lastChange && <DirIcon dir={row.lastChange.direction} />}
                    </div>
                    {row.lastChange?.changedAt && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(row.lastChange.changedAt).toLocaleDateString("en-GB", { 
                          day: "2-digit", 
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    )}
                  </div>

                  {/* Selling Price - col-span-1 */}
                  <div className="col-span-1">
                    <span className="text-sm text-gray-600">${currencySymbol}{row.sellingPrice.toFixed(2)}</span>
                  </div>

                  {/* Margin - col-span-1 */}
                  <div className="col-span-1">
                    <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                      m >= 20 ? "bg-emerald-100 text-emerald-700" :
                      m >= 10 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {margin(row)}%
                    </span>
                  </div>

                  {/* Stock - col-span-1 */}
                  <div className="col-span-1">
                    <span className={`inline-block text-xs px-2 py-1 rounded-full ${stockStatus.class}`}>
                      {stockStatus.text}
                    </span>
                  </div>

                  {/* Actions - col-span-2 */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setHistoryModal({ open: true, row })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                    >
                      <History className="h-3.5 w-3.5" />
                      History
                    </button>
                    <button
                      onClick={() => setUpdateModal({ open: true, row })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg shadow-sm hover:shadow transition-all"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {updateModal.row && (
        <UpdatePriceModal
          open={updateModal.open}
          onOpenChange={v => setUpdateModal(p => ({ ...p, open: v }))}
          supplierId={supplierId}
          supplierName={supplierName}
          productId={updateModal.row.productId}
          productName={updateModal.row.productName}
          sku={updateModal.row.sku}
          currentPrice={updateModal.row.costPrice}
          userId={userId}
          onSuccess={fetchRows}
          currencySymbol = {currencySymbol}
        />
      )}

      {historyModal.row && (
        <PriceHistoryModal
          open={historyModal.open}
          onOpenChange={v => setHistoryModal(p => ({ ...p, open: v }))}
          supplierId={supplierId}
          productId={historyModal.row.productId}
          productName={historyModal.row.productName}
          sku={historyModal.row.sku}
          currencySymbol = {currencySymbol}
        />
      )}
    </>
  );
}