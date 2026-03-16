"use client";

import React, { useState, useMemo }  from "react";
import { Badge }                      from "@/components/form/Badge";
import { Button }                     from "@/components/form/CustomButton";
import { Card, CardContent }          from "@/components/form/Card";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/form/Dialog";
import {
  X, Star, ChevronRight, Package, DollarSign, Tag,
  Archive, Factory, Shield, Edit, Trash2,
  Barcode, Hash, Building2, MapPin, Warehouse, Box,
  AlertTriangle, CheckCircle, Clock, Info, Layers,
  Package2, FileText, ListChecks, Sparkles, FolderTree,
  Ruler, Weight, Zap,
} from "lucide-react";
import { ProductListItem, CategoryInfo } from "../types/product";
import { useCurrencyStore }              from "@/stores/currency.store";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ProductDetailsModalProps {
  open:              boolean;
  onOpenChange:      (open: boolean) => void;
  product:           ProductListItem | null;
  getStockBadge:     (status: string) => { class: string; icon: any };
  onDelete:          (product: ProductListItem) => void;
  onEdit?:           (product: ProductListItem) => void;
  categories?:       any[];
  attributeOptions?: any[];
}

const CATEGORY_COLORS: string[] = [
  "bg-blue-100 text-blue-700 border-blue-300",
  "bg-cyan-100 text-cyan-700 border-cyan-300",
  "bg-teal-100 text-teal-700 border-teal-300",
  "bg-emerald-100 text-emerald-700 border-emerald-300",
  "bg-violet-100 text-violet-700 border-violet-300",
];

const WARRANTY_LABELS: Record<string, string> = {
  "1-month":  "1 Month",
  "3-months": "3 Months",
  "6-months": "6 Months",
  "1-year":   "1 Year",
  "2-years":  "2 Years",
  "3-years":  "3 Years",
  "lifetime": "Lifetime",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
interface InfoRowProps {
  icon:   React.ComponentType<{ className?: string }>;
  label:  string;
  value:  string | number | undefined | null;
  mono?:  boolean;
  color?: string;
}
function InfoRow({ icon: Icon, label, value, mono = false, color = "text-gray-700" }: InfoRowProps) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <span className="text-xs font-medium text-gray-400 w-28 shrink-0">{label}</span>
      <span className={`text-sm font-semibold ${color} ${mono ? "font-mono" : ""} break-all`}>
        {value}
      </span>
    </div>
  );
}

interface StockCardProps { label: string; value: string | number; color: string; border: string; sub?: string; }
function StockCard({ label, value, color, border, sub }: StockCardProps) {
  return (
    <div className={`bg-white rounded-xl p-4 border ${border} shadow-sm hover:shadow-md transition-shadow`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

interface PriceRowProps { label: string; value: string; size?: "sm" | "lg"; color?: string; bold?: boolean; }
function PriceRow({ label, value, size = "sm", color = "text-gray-700", bold = false }: PriceRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`${bold ? "font-bold" : "font-semibold"} ${color} ${size === "lg" ? "text-xl" : "text-base"}`}>{value}</span>
    </div>
  );
}

// ── EnhancedDescription ────────────────────────────────────────────────────
type DescTab = "description" | "specifications" | "features";
function EnhancedDescription({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState<DescTab>("description");
  const fullDescription:  string = product.description  ?? "";
  const shortDescription: string = product.shortDescription ?? "";

  const extractedFeatures: string[] = useMemo(() => {
    if (!fullDescription) return [];
    const results: string[] = [];
    (fullDescription.match(/[•*-]\s*([^\n]+)/g) ?? []).forEach((m) => {
      const f = m.replace(/[•*-]\s*/, "").trim();
      if (f.length > 10 && f.length < 100) results.push(f);
    });
    return [...new Set(results)].slice(0, 8);
  }, [fullDescription]);

  const extractedSpecs: Record<string, string> = useMemo(() => {
    if (!fullDescription) return {};
    const specs: Record<string, string> = {};
    const patterns = [
      { key: "dimensions", regex: /dimensions?:?\s*([^,\n]+(?:[×x])[^,\n]+)/i },
      { key: "weight",     regex: /weight?:?\s*([^,\n]+(?:kg|g|lb|lbs|grams?))/i },
      { key: "material",   regex: /material?:?\s*([^,\n]+)/i },
      { key: "color",      regex: /colou?r?:?\s*([^,\n]+)/i },
      { key: "size",       regex: /size?:?\s*([^,\n]+)/i },
      { key: "power",      regex: /power?:?\s*([^,\n]+(?:w|watts?|volt))/i },
      { key: "warranty",   regex: /warranty?:?\s*([^,\n]+)/i },
    ];
    patterns.forEach(({ key, regex }) => {
      const m = fullDescription.match(regex);
      if (m?.[1]) specs[key] = m[1].trim();
    });
    return specs;
  }, [fullDescription]);

  const hasSpecs = Object.keys(extractedSpecs).length > 0;
  const hasFeatures = extractedFeatures.length > 0;
  const SPEC_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    dimensions: Ruler, weight: Weight, material: Package,
    color: Tag, size: Layers, power: Zap, warranty: Shield,
  };

  if (!fullDescription && !shortDescription && !hasFeatures && !hasSpecs) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FileText className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">No description available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shortDescription && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex gap-3">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Quick Summary</p>
              <p className="text-sm text-blue-800">{shortDescription}</p>
            </div>
          </div>
        </div>
      )}
      {(hasSpecs || hasFeatures) && (
        <div className="flex border-b border-gray-200 gap-1">
          {(["description", hasSpecs && "specifications", hasFeatures && "features"] as (DescTab | false)[]).filter(Boolean).map((tab) => {
            const t = tab as DescTab;
            const icons: Record<DescTab, React.ReactNode> = {
              description:    <FileText   className={`h-3.5 w-3.5 ${activeTab === t ? "text-blue-600" : "text-gray-400"}`} />,
              specifications: <ListChecks className={`h-3.5 w-3.5 ${activeTab === t ? "text-blue-600" : "text-gray-400"}`} />,
              features:       <Sparkles   className={`h-3.5 w-3.5 ${activeTab === t ? "text-blue-600" : "text-gray-400"}`} />,
            };
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-sm font-medium relative transition-colors flex items-center gap-1.5 ${activeTab === t ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
                {icons[t]}<span className="capitalize">{t}</span>
                {activeTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
            );
          })}
        </div>
      )}
      <div className="min-h-[160px]">
        {activeTab === "description" && (
          fullDescription
            ? fullDescription.split(/\n\s*\n/).map((p, i) => <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3">{p.trim()}</p>)
            : <p className="text-sm text-gray-400 italic">No description</p>
        )}
        {activeTab === "specifications" && hasSpecs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(extractedSpecs).map(([key, value]) => {
              const Icon = SPEC_ICONS[key] ?? Package;
              return (
                <div key={key} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase">{key}</p>
                    <p className="text-sm font-semibold text-gray-700">{value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "features" && hasFeatures && (
          <div className="space-y-2">
            {extractedFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">{f}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {hasFeatures && activeTab !== "features" && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Key Highlights
          </p>
          <div className="flex flex-wrap gap-2">
            {extractedFeatures.slice(0, 4).map((f, i) => (
              <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />{f.length > 40 ? f.slice(0, 40) + "…" : f}
              </span>
            ))}
            {extractedFeatures.length > 4 && (
              <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs border border-gray-200">+{extractedFeatures.length - 4} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductDetailsModal({
  open, onOpenChange, product, getStockBadge,
  onDelete, onEdit,
  categories = [], attributeOptions = [],
}: ProductDetailsModalProps) {
  if (!product) return null;

  const currencySymbol = useCurrencyStore((s) => s.currencySymbol) || "£";

  // ── EXACT SAME as VariantsTab ─────────────────────────────────────────────
  const getCategoryName = (catId: any): string => {
    const id = typeof catId === "string" ? catId : catId?.id || catId?._id || "";
    if (!id) return "Unknown";
    const found = categories.find((c) => c._id === id || c.id === id);
    return found?.categoryName || found?.name || found?.title || id;
  };

  // ── EXACT SAME as VariantsTab ─────────────────────────────────────────────
  const getAttributeName = (keyId: string): string => {
    if (!keyId) return keyId;
    const isObjectId = /^[a-f\d]{24}$/i.test(keyId);
    if (!isObjectId) return keyId;
    const found = attributeOptions.find((a) => a._id === keyId || a.id === keyId);
    if (!found) return keyId;
    return (
      found.attributeName || found.name || found.label || found.title ||
      found.attribute_name || found.attrName || found.displayName || keyId
    );
  };

  // ── EXACT SAME as VariantsTab categoryBreadcrumb ──────────────────────────
  const categoryBreadcrumb = useMemo(
    () =>
      ((product as any).categoryPath || []).map((catId: any, i: number) => {
        const id = typeof catId === "string" ? catId : catId?.id || catId?._id || `unknown-${i}`;
        return { id: id || `cat-${i}`, name: getCategoryName(id) };
      }),
    [(product as any).categoryPath, categories]
  );

  // ── First attribute ────────────────────────────────────────────────────────
  const attr     = (product as any).attributes?.[0];
  const pricing  = attr?.pricing?.[0];
  const stock    = attr?.stock ?? {};
  const warranty = attr?.warranty ?? (product as any).warranty ?? {};

  const costPrice    = pricing?.costPrice    ?? (product as any).costPrice    ?? 0;
  const sellingPrice = pricing?.sellingPrice ?? (product as any).sellingPrice ?? 0;
  const retailPrice  = pricing?.retailPrice  ?? (product as any).retailPrice  ?? 0;
  const taxRate      = pricing?.taxRate      ?? 0;
  const vatExempt    = pricing?.vatExempt    ?? false;
  const discount     = pricing?.discountPercentage ?? 0;

  const stockQty    = stock.stockQuantity ?? (product as any).onHand      ?? 0;
  const minStock    = stock.minStockLevel ?? (product as any).reorderLevel ?? 0;
  const maxStock    = stock.maxStockLevel ?? 0;
  const reorderPt   = stock.reorderPoint  ?? (product as any).reorderLevel ?? 0;
  const safetyStock = stock.safetyStock   ?? 0;
  const leadTime    = stock.leadTimeDays  ?? 0;
  const stockLoc    = stock.stockLocation ?? "";
  const binLoc      = stock.binLocation   ?? "";
  const stockStatus = stock.stockStatus   ?? product.stockStatus ?? "";

  const profitMargin = sellingPrice - costPrice;
  const profitPct    = costPrice > 0 ? ((profitMargin / costPrice) * 100).toFixed(1) : "0.0";
  const isLow        = stockQty <= safetyStock && safetyStock > 0;
  const fmt          = (n: number) => `${currencySymbol}${(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-gray-50 p-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-8 py-6 rounded-t-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-white truncate">
                {product.name ?? (product as any).productName}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-sm mt-1 flex flex-wrap gap-3">
                {(product as any).brand       && <span>🏷 {(product as any).brand}</span>}
                {(product as any).modelNumber && <span>Model: {(product as any).modelNumber}</span>}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {product.featured && (
                  <Badge className="bg-yellow-400 text-yellow-900 gap-1 px-2.5 py-1 text-xs">
                    <Star className="h-3 w-3 fill-yellow-900" /> Featured
                  </Badge>
                )}
                <Badge className={`px-2.5 py-1 text-xs ${product.status === "active" ? "bg-emerald-400 text-emerald-900" : "bg-gray-400 text-gray-900"}`}>
                  {product.status}
                </Badge>
                <Badge className={`${getStockBadge(stockStatus || product.stockStatus).class} px-2.5 py-1 text-xs`}>
                  {(stockStatus || product.stockStatus)?.replace("-", " ")}
                </Badge>
                {isLow && <Badge className="bg-red-500 text-white gap-1 px-2.5 py-1 text-xs"><AlertTriangle className="h-3 w-3" /> Low Stock</Badge>}
                {vatExempt && <Badge className="bg-purple-400 text-purple-900 px-2.5 py-1 text-xs">VAT Exempt</Badge>}
              </div>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ROW 1: Image + Identity + Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Image */}
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <div className="h-52 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name ?? ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Package className="h-16 w-16 text-gray-300" />
                    <span className="text-xs text-gray-400">No image</span>
                  </div>
                )}
              </div>
              {((product as any).tags?.length > 0 || (product as any).keywords?.length > 0) && (
                <CardContent className="p-4 space-y-3">
                  {(product as any).tags?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {(product as any).tags.map((t: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(product as any).keywords?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {(product as any).keywords.map((k: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Identity */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> Product Identity
                </h3>
                <InfoRow icon={Barcode}   label="Product SKU"  value={product.sku ?? (product as any).sku} mono />
                <InfoRow icon={Hash}      label="Variant SKU"  value={attr?.sku} mono />
                <InfoRow icon={Barcode}   label="Barcode"      value={(product as any).barcode} mono />
                <InfoRow icon={Building2} label="Brand"        value={(product as any).brand} />
                <InfoRow icon={Factory}   label="Manufacturer" value={(product as any).manufacturer} />
                <InfoRow icon={Info}      label="Model No."    value={(product as any).modelNumber} mono />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Pricing
                </h3>
                <PriceRow label="Cost Price"    value={fmt(costPrice)} />
                <PriceRow label="Selling Price" value={fmt(sellingPrice)} color="text-blue-600" />
                <PriceRow label="Retail Price"  value={fmt(retailPrice)}  color="text-indigo-600" />
                <PriceRow label="Profit Margin" value={`${fmt(profitMargin)} (${profitPct}%)`} color={profitMargin >= 0 ? "text-emerald-600" : "text-red-600"} bold />
                {discount > 0 && <PriceRow label="Discount" value={`${discount}%`} color="text-orange-600" />}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  {taxRate > 0 && (
                    <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">Tax: {taxRate}%</span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${vatExempt ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {vatExempt ? "VAT Exempt" : "VAT Applicable"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ROW 2: Description + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Description */}
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Package2 className="h-3.5 w-3.5" /> Product Description
                </h3>
              </div>
              <CardContent className="p-5">
                <EnhancedDescription product={product} />
              </CardContent>
            </Card>

            {/* Category — EXACT same structure as VariantsTab */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">

              {/* Purple header — same as VariantsTab */}
              <div className="flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-500">
                <Tag className="h-4 w-4 text-white mr-2" />
                <span className="text-sm font-semibold text-white">Category</span>
              </div>

              {/* Current breadcrumb text — same as VariantsTab */}
              <div className="px-4 py-3 bg-white border-b border-gray-100">
                {categoryBreadcrumb.length > 0 ? (
                  <div className="flex items-center gap-1 text-sm text-gray-700 flex-wrap">
                    {categoryBreadcrumb.map((cat: any, i: number) => (
                      <span key={`${cat.id}-${i}`} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                        <span className="text-gray-800">{cat.name}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">No category assigned</span>
                )}
              </div>

              {/* Green badges — same as VariantsTab */}
              {categoryBreadcrumb.length > 0 && (
                <div className="px-4 py-3 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-xs font-semibold text-green-700">Selected Category Path:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {categoryBreadcrumb.map((cat: any, i: number) => (
                      <span key={`badge-${cat.id}-${i}`} className="flex items-center gap-1.5">
                        {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                        <Badge className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          i === 0
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : i === categoryBreadcrumb.length - 1
                            ? "bg-cyan-100 text-cyan-700 border-cyan-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}>
                          {cat.name}
                        </Badge>
                      </span>
                    ))}
                  </div>
                  {/* Full path text */}
                  <p className="text-xs text-gray-400 italic mt-3 bg-white/70 px-3 py-2 rounded-lg border border-gray-100">
                    {categoryBreadcrumb.map((c: any) => c.name).join(" → ")}
                  </p>
                </div>
              )}

              {categoryBreadcrumb.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <FolderTree className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm italic">No category assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* ROW 3: Stock */}
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Archive className="h-3.5 w-3.5" /> Stock Levels
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <StockCard label="In Stock"      value={stockQty}       color={isLow ? "text-red-600" : "text-indigo-700"} border={isLow ? "border-red-200" : "border-indigo-200"} sub="current qty" />
                <StockCard label="Min Level"     value={minStock}       color="text-amber-700"  border="border-amber-200"  sub="min threshold"  />
                <StockCard label="Max Level"     value={maxStock}       color="text-blue-700"   border="border-blue-200"   sub="max capacity"   />
                <StockCard label="Reorder Point" value={reorderPt}      color="text-orange-700" border="border-orange-200" sub="trigger reorder"/>
                <StockCard label="Safety Stock"  value={safetyStock}    color="text-purple-700" border="border-purple-200" sub="buffer qty"     />
                <StockCard label="Lead Time"     value={`${leadTime}d`} color="text-teal-700"   border="border-teal-200"   sub="days"           />
              </div>
            </CardContent>
          </Card>

          {/* ROW 4: Location + Warranty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Storage Location
                </h3>
                <InfoRow icon={Warehouse} label="Stock Location" value={stockLoc} />
                <InfoRow icon={MapPin}    label="Bin Location"   value={binLoc}   />
                <InfoRow icon={Box}       label="Stock Status"
                  value={stockStatus.replace("-", " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  color={stockStatus === "in-stock" ? "text-emerald-600" : stockStatus === "low-stock" ? "text-amber-600" : "text-red-600"}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl bg-gradient-to-br from-green-50/50 to-emerald-50/50">
              <CardContent className="p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Warranty
                </h3>
                {(warranty.warrantyType || warranty.warrantyPeriod) ? (
                  <>
                    <InfoRow icon={Shield} label="Type"   value={warranty.warrantyType} color="text-emerald-700" />
                    <InfoRow icon={Clock}  label="Period" value={WARRANTY_LABELS[warranty.warrantyPeriod] ?? warranty.warrantyPeriod} color="text-emerald-700" />
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">No warranty information</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ROW 5: Variants — EXACT same structure as VariantsTab */}
          <div className="rounded-xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-indigo-900 text-sm">Product Variants</span>
              <Badge className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-1">
                {(product as any).attributes?.length || 0}
              </Badge>
            </div>

            <div className="p-4 space-y-3">
              {!(product as any).attributes?.length && (
                <p className="text-center py-8 text-gray-400 text-sm">No variants found</p>
              )}
              {((product as any).attributes ?? []).map((variant: any, idx: number) => {
                const attrEntries: [string, unknown][] = Object.entries(variant.attributes ?? {});
                const vPricing = variant.pricing?.[0];
                const vStock   = variant.stock ?? {};
                return (
                  <Card key={variant._id ?? idx} className="border border-gray-100 hover:border-indigo-200 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-gray-800">Variant #{idx + 1}</span>
                              {idx === 0 && <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0 rounded-full">Primary</Badge>}
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">SKU: {variant.sku}</p>
                          </div>
                        </div>
                      </div>

                      {/* Attribute badges — same as VariantsTab */}
                      {/* {attrEntries.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50">
                          {attrEntries.map(([key, value]) => (
                            <Badge key={key} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                              <span className="text-gray-500 mr-1">{getAttributeName(key)}:</span>
                              {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )} */}

                      {/* Mini pricing + stock */}
                      {/* {(vPricing || vStock.stockQuantity !== undefined) && (
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100 text-xs flex-wrap">
                          {vPricing && (
                            <>
                              <span className="text-gray-400">Cost:</span>
                              <span className="font-bold text-emerald-600">{currencySymbol}{vPricing.costPrice}</span>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-400">Sell:</span>
                              <span className="font-bold text-blue-600">{currencySymbol}{vPricing.sellingPrice}</span>
                              {vPricing.taxRate > 0 && <><span className="text-gray-300">|</span><span className="text-amber-600 font-semibold">Tax {vPricing.taxRate}%</span></>}
                              {vPricing.vatExempt && <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-semibold">VAT Exempt</span>}
                            </>
                          )}
                          {vStock.stockQuantity !== undefined && (
                            <>
                              <span className="text-gray-300 ml-auto">|</span>
                              <span className="text-gray-400">Stock:</span>
                              <span className={`font-bold ${vStock.stockQuantity > (vStock.reorderPoint ?? 0) ? "text-emerald-600" : "text-red-600"}`}>
                                {vStock.stockQuantity} units
                              </span>
                            </>
                          )}
                        </div>
                      )} */}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onEdit && (
              <Button onClick={() => onEdit(product)} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                <Edit className="h-4 w-4 mr-2" /> Edit Product
              </Button>
            )}
            <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
              onClick={() => { if (window.confirm("Are you sure?")) onDelete(product); }}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Product
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}