"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Loader2,
  LayoutGrid,
  Table2,
} from "lucide-react";
import StatsCards from "@/app/common-form/StatsCard";
import WareHousesTable from "./WareHousesTable";
import WareHousesForm from "./WareHousesForm";
import Pagination from "@/components/ui/Pagination";
import { fetchWarehouses, deleteWarehouse } from "@/hooks/useWareHouses";
import { IWarehouse } from "../../../../../../../common/IWarehouses.interface";
import { basicCommonInfoDto } from "../../../../../../../common/DTOs/profilecommonDto";
import AnimatedIcon from "@/app/common-form/AnimatedIcon";

const THEME_COLOR = "var(--primary-gradient)"; // Changed to match blueprint gradient pattern

export interface WarehouseWithPopulated
  extends Omit<IWarehouse, "personId" | "contactId" | "addressId"> {
  person: basicCommonInfoDto["person"];
  contact: basicCommonInfoDto["contact"];
  address: basicCommonInfoDto["address"] & {
    userId: string;
    city?: string;
    country?: string;
    address?: string;
    zipCode?: string;
  };
}

export default function WareHousesClient() {
  const [dataList, setDataList] = useState<WarehouseWithPopulated[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState<WarehouseWithPopulated | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [displayView, setDisplayView] = useState<"table" | "card">("table");
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Stats States
  const [totalActiveCount, setTotalActiveCount] = useState(0);
  const [totalInactiveCount, setTotalInactiveCount] = useState(0);

  const mapToWarehouseWithPopulated = (
    item: IWarehouse
  ): WarehouseWithPopulated => {
    const resolvedUserId =
      typeof item.userId === "object" ? (item.userId as any)._id : item.userId;

    return {
      _id: item._id || "",
      userId: item.userId,
      wareHouseStatusId: item.wareHouseStatusId,
      openTime: item.openTime,
      closeTime: item.closeTime,
      capacity: item.capacity,
      availableCapacity: item.availableCapacity,
      isActive: item.isActive ?? true,
      isDeleted: item.isDeleted ?? false,
      isDefault: item.isDefault ?? false,
      person:
        item.personId && typeof item.personId === "object"
          ? (item.personId as any)
          : { firstName: "", lastName: "" },
      contact:
        item.contactId && typeof item.contactId === "object"
          ? (item.contactId as any)
          : { mobileNumber: "", phoneNumber: "", emailId: "" },
      address:
        item.addressId && typeof item.addressId === "object"
          ? {
              ...(item.addressId as any),
              userId: resolvedUserId,
            }
          : {
              address: "",
              city: "",
              country: "",
              zipCode: "",
              userId: resolvedUserId,
            },
    };
  };

  const fetchData = useCallback(async (page = 1, search = "") => {
    try {
      setLoading(true);
      const res = await fetchWarehouses(page, 10, search);
      const mappedData = (res.data || []).map(mapToWarehouseWithPopulated);
      setDataList(mappedData);
      
      // Calculate stats from all data (or you can fetch stats separately)
      setTotalActiveCount(mappedData.filter(d => d.isActive).length || 0);
      setTotalInactiveCount(mappedData.filter(d => !d.isActive).length || 0);
      
      setTotalPages(Math.ceil(res.total / 10) || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch Error:", err);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1, searchTerm);
  }, [searchTerm, fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      await deleteWarehouse(id);
      fetchData(currentPage, searchTerm);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleEdit = (item: WarehouseWithPopulated) => {
    setEditingData(item);
    setShowForm(true);
  };

  const handleStatusChange = (id: string, newStatus: boolean) => {
    // Implement status change logic here
    console.log("Status changed:", id, newStatus);
  };

  const filteredDataList = useMemo(() => {
    if (filterStatus === 'all') return dataList;
    return dataList.filter((d) => (filterStatus === 'active' ? d.isActive : !d.isActive));
  }, [filterStatus, dataList]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Updated Gradient Header - Matching blueprint pattern */}
        <div className="bg-linear-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl p-6 md:p-7 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slideInLeft">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <AnimatedIcon icon={<WarehouseIcon size={32} className="text-white" />} />
            <div className="flex-1 md:flex-none">
              <h1 className="text-3xl md:text-4xl font-bold">Warehouses</h1>
              <p className="text-orange-100 text-sm md:text-lg">Manage warehouses, capacity, and operational details</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingData(null);
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 text-orange-600 bg-white hover:bg-white/90 px-5 py-2 rounded-lg text-sm h-9 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 w-full md:w-auto"
          >
            <Plus size={22} /> Add Warehouse
          </button>
        </div>

        {/* Reusable Stats Cards Component */}
        <StatsCards 
          totalCount={dataList.length}
          activeCount={totalActiveCount}
          inactiveCount={totalInactiveCount}
          onFilterChange={(filter) => setFilterStatus(filter)}
          labels={{
            total: "Total Warehouses",
            active: "Active Warehouses",
            inactive: "Inactive Warehouses"
          }}
          icons={{ total: <WarehouseIcon size={24} /> }}
        />

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-3 focus-within:ring-2 focus-within:ring-orange-300 transition-all">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by location or manager name..."
            className="w-full outline-none text-lg"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className="bg-white p-5 pt-9 border-t-4! border-[#FE6B1D]! shadow-sm rounded-b-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 mb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Warehouse List
              </h2>
              <p className="text-sm text-gray-500">Manage warehouse inventory and operational status</p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-linear-to-r from-orange-50 to-pink-50 p-1 rounded-lg border border-orange-200 w-full md:w-auto">
              <button
                onClick={() => setDisplayView("card")}
                className={`flex-1 md:flex-none px-3 h-8 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  displayView === "card" 
                    ? "bg-linear-to-r from-orange-500 to-pink-600 text-white shadow-lg" 
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <LayoutGrid size={16} /> <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => setDisplayView("table")}
                className={`flex-1 md:flex-none px-3 h-8 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  displayView === "table" 
                    ? "bg-linear-to-r from-orange-500 to-pink-600 text-white shadow-lg" 
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <Table2 size={16} /> <span className="text-sm">Table</span>
              </button>
            </div>
          </div>

          {showForm && (
            <WareHousesForm
              editingData={editingData}
              onClose={() => {
                setShowForm(false);
                setEditingData(null);
              }}
              onRefresh={() => fetchData(currentPage, searchTerm)}
              themeColor="#FE6B1D"
            />
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="animate-spin text-orange-600" size={48} />
              <p className="mt-4 text-gray-400 font-medium">Loading warehouses...</p>
            </div>
          ) : (
            <>
              {/* Filter Status Feedback */}
              {filterStatus !== 'all' && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-orange-700 font-medium">
                    Showing {filterStatus} ({filteredDataList.length})
                  </span>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className="text-xs text-orange-600 hover:text-orange-800 font-bold"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              <WareHousesTable
                data={filteredDataList}
                displayView={displayView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                themeColor="#FE6B1D"
              />

              {filteredDataList.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchData(page, searchTerm)}
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