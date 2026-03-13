// app/dashboard/suppliers/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Building2,
  TrendingUp,
  Package,
  DollarSign,
  Truck,
} from "lucide-react";
import { Button } from "@/components/form/CustomButton";

import { useSupplier } from "./hooks/useSupplier";
import { SupplierHeader } from "./components/SupplierHeader";
import { SupplierTabs, type TabId } from "./components/SupplierTabs";
import { InfoTab } from "./components/tabs/InfoTab";
import { OrdersTab } from "./components/tabs/OrdersTab";
import { ReturnsTab } from "./components/tabs/ReturnsTab";
import { SupplierPricingTab } from "./components/tabs/PricingTab";
import  PaymentsTab  from "./components/tabs/PaymentsTab";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalValue: 0,
    leadTime: "—",
  });

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");

    // Sirf ek API call — 4 numbers aate hain
    axios
      .get(`${BASE_URL}/supplier-price-history/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setStats(r.data.data));
  }, [id]);

  const userId =
    typeof window !== "undefined"
      ? (() => {
          try {
            const u = JSON.parse(localStorage.getItem("user") || "{}");
            return u.id || u._id || "";
          } catch {
            return "";
          }
        })()
      : "";

  const { supplier, loading, error } = useSupplier(id);

  /* ── Loading ─────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-2xl opacity-40 animate-pulse" />
          <div className="relative bg-white rounded-2xl px-10 py-7 shadow-2xl flex items-center gap-4 border border-gray-100">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-700 font-semibold">
              Loading supplier dashboard…
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────────────── */
  if (!supplier || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md text-center border border-gray-100">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto" />
          <h3 className="text-xl font-bold text-gray-800 mt-6">
            Supplier Not Found
          </h3>
          <p className="text-gray-500 mt-2 text-sm">
            {error ||
              "The supplier you're looking for doesn't exist or has been removed."}
          </p>
          <Button
            variant="outline"
            className="mt-6 border-gray-300 hover:border-gray-400"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  /* ── Derived values ──────────────────────────────────────────────────────── */
  const name =
    supplier.contactInformation?.primaryContactName ||
    supplier.supplierIdentification?.legalBusinessName ||
    "Unknown Supplier";

  const businessName = supplier.supplierIdentification?.legalBusinessName;

  /* ── Render ──────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-gradient-to-br from-emerald-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <SupplierHeader
          name={name}
          businessName={businessName}
          isActive={supplier.isActive}
          supplierId={id}
          email={supplier.contactInformation?.emailAddress}
          phone={supplier.contactInformation?.phoneNumber}
          stats={{
            totalProducts: stats.totalProducts,
            activeProducts: stats.activeProducts,
            avgLeadTime: String(stats.leadTime),
          }}
        />

        {/* ── STATS ROW ──────────────────────────────────────────────────── */}
        <div className="w-full px-6 mt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Package,
                label: "Total Products",
                value: stats.totalProducts,
                gradient: "from-blue-500 to-blue-600",
                glow: "from-blue-400 to-blue-600",
                bg: "from-blue-50 to-blue-100/50",
                border: "border-blue-100",
              },
              {
                icon: TrendingUp,
                label: "Active Products",
                value: stats.activeProducts,
                gradient: "from-emerald-500 to-emerald-600",
                glow: "from-emerald-400 to-emerald-600",
                bg: "from-emerald-50 to-emerald-100/50",
                border: "border-emerald-100",
              },
              {
                icon: DollarSign,
                label: "Total Value",
                value: `£${stats.totalValue.toLocaleString()}`,
                gradient: "from-purple-500 to-purple-600",
                glow: "from-purple-400 to-purple-600",
                bg: "from-purple-50 to-purple-100/50",
                border: "border-purple-100",
              },
              {
                icon: Truck,
                label: "Lead Time",
                value: `${stats.leadTime} days`,
                gradient: "from-amber-500 to-amber-600",
                glow: "from-amber-400 to-amber-600",
                bg: "from-amber-50 to-amber-100/50",
                border: "border-amber-100",
              },
            ].map(
              ({ icon: Icon, label, value, gradient, glow, bg, border }) => (
                <div
                  key={label}
                  className={`bg-gradient-to-br ${bg} rounded-2xl border ${border} p-5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${glow} rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity`}
                      />
                      <div
                        className={`relative w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-sm`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* ── TABS ───────────────────────────────────────────────────────── */}
        <div className="w-full px-6 mt-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-1.5">
            <SupplierTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* ── TAB CONTENT ────────────────────────────────────────────────── */}
        <div className="w-full px-6 py-6">
          {/* Glow border wrapper */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-70" />
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl border border-gray-200/60 shadow-xl overflow-hidden">
              {/* Tab label bar */}
              <div className="px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">
                      {activeTab === "info" && "Supplier Information"}
                      {activeTab === "pricing" && "Products & Pricing"}
                      {activeTab === "orders" && "Purchase Orders"}
                      {activeTab === "returns" && "Goods Returns"}
                       {activeTab === "payment" && "Payment"}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activeTab === "info" &&
                        "Contact details, business info, address and contract terms"}
                      {activeTab === "pricing" &&
                        "All linked product variants with cost prices and margin"}
                      {activeTab === "orders" &&
                        "All purchase orders placed with this supplier"}
                      {activeTab === "returns" &&
                        "All return notes and credits for this supplier"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
      {activeTab === "payment" &&
    "Payment history, credit notes and outstanding balance"}
</p>    
                  </div>

                  {activeTab === "orders" && (
                    <Button
                        onClick={ ()  => router.push('/dashboard/product-Orders')}
                     className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/20 text-sm">
                      + Create New PO
                    </Button>
                  )}
                  {activeTab === "returns" && (
                    <Button    onClick={ ()  => router.push('/dashboard/product-goods-return')} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md shadow-purple-500/20 text-sm">
                      + Create Return
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {activeTab === "info" && <InfoTab supplier={supplier} />}

                {activeTab === "pricing" && (
                  <SupplierPricingTab
                    supplierId={supplier._id}
                    supplierName={name}
                    userId={userId}
                  />
                )}

                {activeTab === "orders" && (
                  <OrdersTab supplierId={supplier._id} userId={userId} />
                )}

                {activeTab === "returns" && (
                  <ReturnsTab supplierId={supplier._id} userId={userId} />
                )}
               {activeTab === "payment" && (
              <PaymentsTab supplierId={supplier._id}  supplierName={name}
 />
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
