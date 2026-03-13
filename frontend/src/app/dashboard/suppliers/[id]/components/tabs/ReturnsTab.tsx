"use client";
import {
  RotateCcw,
  Loader2,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useSupplierReturns } from "../../hooks/useSupplierReturns";
import { Badge } from "@/components/form/Badge";
import { useRouter } from "next/navigation";
import { useGoodsReturn } from "@/hooks/useGoodsReturn";
interface Props {
  supplierId: string;
  userId: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; gradient: string; icon: any }
> = {
  pending: {
    label: "Pending",
    gradient: "from-amber-500 to-orange-500",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    gradient: "from-blue-500 to-cyan-500",
    icon: CheckCircle,
  },
  "in-transit": {
    label: "In Transit",
    gradient: "from-purple-500 to-pink-500",
    icon: Package,
  },
  completed: {
    label: "Completed",
    gradient: "from-emerald-500 to-teal-500",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    gradient: "from-red-500 to-rose-500",
    icon: XCircle,
  },
};

export function ReturnsTab({ supplierId, userId }: Props) {
  const { returns, loading } = useSupplierReturns(supplierId, userId);
  const router = useRouter();

  const { stats } = useGoodsReturn({ supplierId });

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-white rounded-2xl px-8 py-4 shadow-xl flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            <span className="text-sm font-medium text-gray-600">
              Loading returns...
            </span>
          </div>
        </div>
      </div>
    );

  if (returns.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full blur-2xl opacity-20"></div>
          <div className="relative bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4">
              <RotateCcw className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              No Returns Yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              No goods returns have been created for this supplier.
            </p>
            <button
              onClick={() =>
                router.push(
                  "/dashboard/product-goods-return",
                )
              }
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl transition-shadow"
            >
              Create Return
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Returns</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalReturns}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total values</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalValue}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-30"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-purple-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Return #
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Date
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Items
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Value
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Status
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {returns.map((ret: any) => {
                  const cfg =
                    STATUS_CONFIG[ret.status] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={ret._id}
                      className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                            <RotateCcw className="h-4 w-4 text-purple-700" />
                          </div>
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {ret.grtnNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(ret.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-gray-100 text-gray-700 font-medium">
                          {ret.items?.length ?? 0} items
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">
                          £
                          {console.log("ret", ret)}
                          {ret.items.map((value: any, index: number) => (
  <span key={index}>{value.totalAmount || "0.00"}</span>
))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient} rounded-full blur-md opacity-30`}
                          ></div>
                          <div
                            className={`relative px-3 py-1.5 bg-gradient-to-r ${cfg.gradient} text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1.5`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {cfg.label}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
