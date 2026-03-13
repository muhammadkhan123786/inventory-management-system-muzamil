// components/tabs/OrdersTab.tsx
import { ShoppingCart, Loader2, Package, CheckCircle ,Clock , Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useSupplierOrders } from "../../hooks/useSupplierOrders";
import { Badge } from "@/components/form/Badge";

interface Props { supplierId: string; userId: string }

const STATUS_CONFIG: Record<string, { label: string; gradient: string; dot: string }> = {
  draft:     { label: "Draft",     gradient: "from-gray-500 to-slate-500", dot: "bg-gray-400" },
  ordered:   { label: "Ordered",   gradient: "from-blue-500 to-cyan-500", dot: "bg-blue-500" },
  received:  { label: "Received",  gradient: "from-emerald-500 to-teal-500", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", gradient: "from-red-500 to-rose-500", dot: "bg-red-500" },
};

export function OrdersTab({ supplierId, userId }: Props) {
  const { orders, loading } = useSupplierOrders(supplierId, userId);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-white rounded-2xl px-8 py-4 shadow-xl flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm font-medium text-gray-600">Loading orders...</span>
        </div>
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-400 rounded-full blur-2xl opacity-20"></div>
        <div className="relative bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingCart className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Purchase Orders</h3>
          <p className="text-sm text-gray-500 mb-6">No purchase orders have been created for this supplier yet.</p>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-shadow">
            Create First Order
          </button>
        </div>
      </div>
    </div>
  );

  const totalValue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
  const received = orders.filter((o: any) => o.status === "received").length;
  const pending = orders.filter((o: any) => o.status === "ordered").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
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
                <p className="text-sm text-gray-500">Received</p>
                <p className="text-2xl font-bold text-gray-800">{received}</p>
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
                <p className="text-2xl font-bold text-gray-800">{pending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-800">£{totalValue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-2xl blur-xl opacity-20"></div>
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">PO Number</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Date</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Items</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Total</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Status</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((po: any) => {
                  const cfg = STATUS_CONFIG[po.status] || STATUS_CONFIG.draft;
                  return (
                    <tr key={po._id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                            <Package className="h-4 w-4 text-blue-700" />
                          </div>
                          <span className="font-mono text-sm font-semibold text-gray-800">{po.orderNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(po.orderDate || po.createdAt).toLocaleDateString("en-GB", { 
                            day: "2-digit", 
                            month: "short", 
                            year: "numeric" 
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-gray-100 text-gray-700 font-medium">
                          {po.items?.length ?? 0} items
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-800">£{(po.total || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient} rounded-full blur-md opacity-30`}></div>
                          <div className={`relative px-3 py-1.5 bg-gradient-to-r ${cfg.gradient} text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`}></span>
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