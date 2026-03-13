// components/SupplierHeader.tsx
"use client";
import { ArrowLeft, Edit, Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  name: string;
  businessName?: string;
  isActive: boolean;
  supplierId: string;
  email?: string;
  phone?: string;
  stats: {
    totalProducts: number;
    activeProducts: number;
    avgLeadTime: string | number;
  };
}

export function SupplierHeader({ name, businessName, isActive, supplierId, email, phone, stats }: Props) {
  const router = useRouter();

  return (
    <div className="relative w-full">
      {/* Full-width gradient band */}
      <div className="absolute inset-0 h-44 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
      <div
        className="absolute inset-0 h-44 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* Card sits half-over the gradient */}
      <div className="relative w-full px-6 pt-6 pb-0">
        {/* Back + Edit row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <span className="p-1.5 rounded-lg bg-white/15 group-hover:bg-white/25 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">Back to Suppliers</span>
          </button>

          <button
            onClick={() => router.push(`/dashboard/suppliers/${supplierId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white rounded-xl text-sm font-semibold transition-all backdrop-blur-sm"
          >
            <Edit className="h-4 w-4" />
            Edit Supplier
          </button>
        </div>

        {/* White card */}
        <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-start justify-between gap-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-md opacity-60" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{name}</h1>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isActive
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-gray-100 border-gray-200 text-gray-500"
                    }`}>
                      {isActive
                        ? <><CheckCircle className="h-3 w-3" /> Active</>
                        : <><XCircle className="h-3 w-3" /> Inactive</>
                      }
                    </span>
                  </div>

                  {businessName && businessName !== name && (
                    <p className="text-gray-500 text-sm mt-0.5">{businessName}</p>
                  )}

                  <div className="flex items-center gap-5 mt-3 flex-wrap">
                    {email && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <span className="p-1 rounded-md bg-blue-50 text-blue-500">
                          <Mail className="h-3.5 w-3.5" />
                        </span>
                        {email}
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <span className="p-1 rounded-md bg-green-50 text-green-500">
                          <Phone className="h-3.5 w-3.5" />
                        </span>
                        {phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right — mini stats */}
              <div className="hidden lg:flex items-center divide-x divide-gray-100 shrink-0 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                {[
                  { label: "Products",  value: stats.totalProducts,  color: "text-blue-600"   },
                  { label: "Active",    value: stats.activeProducts,  color: "text-emerald-600"},
                  { label: "Lead Time", value: `${stats.avgLeadTime}d`, color: "text-amber-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="px-8 py-4 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}