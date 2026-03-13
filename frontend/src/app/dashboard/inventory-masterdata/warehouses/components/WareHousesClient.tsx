"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import WareHousesTable from "./WareHousesTable";
import WareHousesForm from "./WareHousesForm";
import Pagination from "@/components/ui/Pagination";
import { fetchWarehouses, deleteWarehouse } from "@/hooks/useWareHouses";
import { IWarehouse } from "../../../../../../../common/IWarehouses.interface";
import { basicCommonInfoDto } from "../../../../../../../common/DTOs/profilecommonDto";

const THEME_COLOR = "#FE6B1D";

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
  const [editingData, setEditingData] = useState<WarehouseWithPopulated | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-3xl font-extrabold flex items-center gap-3"
              style={{ color: THEME_COLOR }}
            >
              <WarehouseIcon size={36} /> Warehouse Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage warehouses, their capacity, and operational details
            </p>
          </div>
          <button
            onClick={() => {
              setEditingData(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all active:scale-95"
            style={{ backgroundColor: THEME_COLOR }}
          >
            <Plus size={22} /> Add Warehouse
          </button>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex items-center gap-3 border border-gray-100">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by location or manager name..."
            className="w-full outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {(showForm || editingData) && (
          <WareHousesForm
            editingData={editingData}
            onClose={() => {
              setShowForm(false);
              setEditingData(null);
            }}
            onRefresh={() => fetchData(currentPage, searchTerm)}
            themeColor={THEME_COLOR}
          />
        )}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-gray-400 font-medium">Fetching warehouses...</p>
          </div>
        ) : (
          <>
            <WareHousesTable
              data={dataList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              themeColor={THEME_COLOR}
            />
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchData(page, searchTerm)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
