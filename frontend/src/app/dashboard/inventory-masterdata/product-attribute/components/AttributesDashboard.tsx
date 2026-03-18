"use client";
import React, { useState, useEffect, useCallback } from "react";
import RotatingIcon from "../../components/RotatingIcon";
import StatCard from "../../components/StatCard";
import { fetchAttributes } from "@/hooks/useAttributes";
import { IAttribute } from "../../../../../../../common/IProductAttributes.interface";
import { Layers, CheckCircle2, TreePine, Globe, Plus, Tag } from "lucide-react";
import AttributeTable from "./AttributesTable";
import AnimatedModal from "@/components/form/Modal";
import AttributeForm from "./AttributeForm";
import ShowIcon from "@/components/form/ShowIcons";
import Pagination from "@/components/ui/Pagination"; // adjust path to your Pagination component
import { deleteAttribute } from "@/hooks/useAttributes";

const LIMIT = 10;

const AttributesDashboard: React.FC = () => {
  const [attributes, setAttributes] = useState<IAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & search state — single source of truth
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<IAttribute | null>(null);

  // Debounce: wait 400 ms after the user stops typing before firing the request
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on every new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAttributeData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAttributes(page, LIMIT, debouncedSearch, "");
      setAttributes((res.data as unknown as IAttribute[]) || []);
      setTotal(res.total);
    } catch (error) {
      console.error("Failed to load attributes", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchAttributeData();
  }, [fetchAttributeData]);

  const totalPages = Math.ceil(total / LIMIT);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleAddAttribute = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditAttribute = (attr: IAttribute) => {
    setEditingData(attr);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleDeleteAttribute = async (id: string) => {
    try {
      if (confirm("Are you sure you want to delete this attribute?")) {
        await deleteAttribute(id);
        // If deleting the last item on a page > 1, go back one page
        if (attributes.length === 1 && page > 1) {
          setPage((p) => p - 1);
        } else {
          await fetchAttributeData();
        }
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // Stats are derived from the FULL dataset via the backend's aggregate fields.
  // fetchAttributes can return activeCount / inactiveCount — use them if available,
  // otherwise fall back to counting from the current page slice.
  const stats = [
    {
      label: "Total",
      value: total,
      subLabel: "Total Attributes",
      icon: Layers,
      badge: "Total",
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Active",
      value: attributes.filter((a) => a.isActive).length,
      subLabel: "Active (this page)",
      icon: CheckCircle2,
      badge: "Active",
      color: "from-emerald-500 to-teal-400",
    },
    {
      label: "Category",
      value: new Set(
        attributes.filter((a) => a.categoryId).map((a) => a.categoryId)
      ).size,
      subLabel: "Categories used",
      icon: TreePine,
      badge: "Categories",
      color: "from-purple-500 to-pink-400",
    },
    {
      label: "Default",
      value: attributes.filter((a) => a.isDefault).length,
      subLabel: "Default (this page)",
      icon: Globe,
      badge: "Default",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 p-8 mb-6 shadow-xl flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <RotatingIcon
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 37" fill="none">
                <path d="M4.59926 7.54546L14.4883 6.91394" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.1388 6.55303L30.0279 5.92151" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.3207 18.8472L18.0352 18.0353" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23.6859 17.6744L30.7495 17.2233" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.04238 30.149L13.106 29.6979" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.7572 29.337L31.4717 28.5251" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14.3076 4.0885L14.6685 9.73938" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23.5059 14.8489L23.8668 20.4998" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.9258 26.8724L13.2867 32.5233" stroke="currentColor" strokeWidth="2.8312" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            containerClassName="w-16 h-16 bg-white/20 backdrop-blur-md shadow-inner"
            iconClassName="text-white w-8 h-8"
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Product Attributes</h1>
            <p className="text-white/90 mt-1 text-lg">
              Manage category-based product attributes
            </p>
          </div>
        </div>

        <button
          onClick={handleAddAttribute}
          className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95"
        >
          <Plus size={18} />
          Add Attribute
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            {...stat}
            gradientClass={stat.color}
            badgeText={stat.badge}
          />
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <AttributeTable
          data={attributes}
          loading={loading}
          searchTerm={search}
          onSearchChange={setSearch}
          totalCount={total}
          onEdit={handleEditAttribute}
          onDelete={handleDeleteAttribute}
        />
      </div>

      {/* Pagination — rendered only when there are multiple pages */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="max-w-[600px] max-h-[700px]"
        title={editingData ? "Edit Attribute" : "Add New Attribute"}
        desicripation="Enter the details for the new product attribute"
        icon={
          <ShowIcon
            icon={Tag}
            size={24}
            className="text-white"
            gradientColor="from-purple-500 to-pink-500"
          />
        }
      >
        <AttributeForm
          editingData={editingData}
          onClose={handleCloseModal}
          onRefresh={fetchAttributeData}
          themeColor="#D622A5"
        />
      </AnimatedModal>
    </div>
  );
};

export default AttributesDashboard;