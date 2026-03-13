"use client";
import { useState, useEffect, useMemo } from "react";
import { FileText, Plus, Search, Loader2, LayoutGrid, Table2 } from "lucide-react";
import StatsCards from "@/app/common-form/StatsCard";
import PaymentTermTable from "./PaymentTermTable";
import PaymentTermForm from "./PaymentTermForm";
import Pagination from "@/components/ui/Pagination";
import AnimatedIcon from "@/app/common-form/AnimatedIcon";
import { useFormActions } from "@/hooks/useFormActions";
import { getAll } from "@/helper/apiHelper";

const THEME_COLOR = "var(--primary-gradient)";

type PaymentTermWithId = any & { _id: string };

export default function PaymentTermClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState<PaymentTermWithId | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayView, setDisplayView] = useState<"table" | "card">("table");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Stats States
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [totalInactiveCount, setTotalInactiveCount] = useState(0);

  const { 
    data, 
    total, 
    isLoading, 
    deleteItem, 
    updateItem 
  } = useFormActions<PaymentTermWithId>(
    "/payment-terms", 
    "paymentTerms", 
    "Payment Term", 
    currentPage, 
    searchTerm
  );

  // Stats Logic: Accurate global counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allDataRes = await getAll<PaymentTermWithId>("/payment-terms", {
          limit: "1000", 
          search: searchTerm.trim(),
        });
        setTotalActiveCount(allDataRes.data?.filter((d) => d.isActive).length || 0);
        setTotalInactiveCount(allDataRes.data?.filter((d) => !d.isActive).length || 0);
      } catch (err) {
        console.error("Stats Fetch Error:", err);
      }
    };
    fetchStats();
  }, [data, searchTerm]);

  const filteredDataList = useMemo(() => {
    if (filterStatus === 'all') return data;
    return data.filter((d) => (filterStatus === 'active' ? d.isActive : !d.isActive));
  }, [filterStatus, data]);

  const handleDelete = (id: string) => {
    deleteItem(id);
  };

  const handleStatusChange = (id: string, newStatus: boolean) => {
    updateItem({ id, payload: { isActive: newStatus } });
  };

  const totalPages = Math.ceil(total / 12) || 1;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-cyan-500 to-teal-600 rounded-2xl p-6 md:p-7 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slideInLeft">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <AnimatedIcon icon={<FileText size={32} className="text-white" />} />
            <div className="flex-1 md:flex-none">
              <h1 className="text-3xl md:text-4xl font-bold">Payment Terms</h1>
              <p className="text-blue-100 text-sm md:text-lg">Manage payment durations and conditions for your invoices</p>
            </div>
          </div>
          <button
            onClick={() => { setEditingData(null); setShowForm(true); }}
            className="flex items-center justify-center gap-2 text-blue-600 bg-white hover:bg-white/90 px-5 py-2 rounded-lg text-sm h-9 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
          >
            <Plus size={22} /> Add Payment Term
          </button>
        </div>

        {/* Reusable Stats Cards Component with Filter */}
        <StatsCards 
          totalCount={total}
          activeCount={totalActiveCount}
          inactiveCount={totalInactiveCount}
          onFilterChange={(filter) => setFilterStatus(filter)}
          labels={{
            total: "Total Payment Terms",
            active: "Active Terms",
            inactive: "Inactive Terms"
          }}
          icons={{ total: <FileText size={24} /> }}
        />

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search payment term name..."
            className="w-full outline-none text-lg"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="bg-white p-5 pt-9 border-t-4! border-[#2B7FFF]! ">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Payment Terms
              </h2>
              <p className="text-sm text-gray-500">Configure payment terms for invoices and transactions</p>
            </div>

            <div className="flex gap-2 bg-linear-to-r from-blue-50 to-cyan-50 p-1 rounded-lg border border-blue-200 w-full md:w-auto">
              <button
                onClick={() => setDisplayView("card")}
                className={`flex-1 md:flex-none px-3 h-8 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  displayView === "card" ? "bg-linear-to-r from-blue-500 to-teal-600 text-white shadow-lg" : "text-gray-600 hover:text-blue-600 hover:bg-[#10b981]"
                }`}
              >
                <LayoutGrid size={16} /> <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => setDisplayView("table")}
                className={`flex-1 md:flex-none px-3 h-8 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  displayView === "table" ? "bg-linear-to-r from-blue-500 to-teal-600 text-white shadow-lg" : "text-gray-600 hover:text-blue-600 hover:bg-[#10b981]"
                }`}
              >
                <Table2 size={16} /> <span className="text-sm">Table</span>
              </button>
            </div>
          </div>

          {showForm && (
            <PaymentTermForm
              editingData={editingData}
              onClose={() => setShowForm(false)}
              onRefresh={() => {}}
              themeColor={THEME_COLOR}
            />
          )}

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="mt-4 text-gray-400 font-medium">Loading payment terms...</p>
            </div>
          ) : (
            <>
              {/* Filter Status Display */}
              {filterStatus !== 'all' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    Showing {filterStatus} ({filteredDataList.length})
                  </span>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
              <PaymentTermTable
                data={filteredDataList}
                displayView={displayView}
                onEdit={(item) => { setEditingData(item); setShowForm(true); }}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                themeColor={THEME_COLOR}
              />
              {filteredDataList.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
