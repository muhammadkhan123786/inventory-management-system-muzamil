"use client";
import React, { useState, useEffect, useCallback } from "react";
import RotatingIcon from "../../components/RotatingIcon";
import StatCard from "../../components/StatCard";
import { getMaxDepth } from "./utils/GetMaxDepth";
import {
  TreePine, Layers, CheckCircle2, Folder,
  List, Plus, Tag, Network,
} from "lucide-react";
import ShowIcon from "@/components/form/ShowIcons";
import ProductCategories from "./ProductCategories";
import CategoryForm from "./CategoryForm";
import AnimatedModal from "@/components/form/Modal";
import Pagination from "@/components/ui/Pagination";
import {
  fetchCategories,
  deleteCategory,
  createCategory,
} from "@/hooks/useCategory";
import { ICategory } from "../../../../../../../common/ICategory.interface";

// How many rows per page
const LIMIT = 10;

const CategoryDashboard = () => {
  // ── Modal ────────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<ICategory | null>(null);
  const [preSelectedCategoryId, setPreSelectedCategoryId] = useState<string | null>(null);

  // ── View toggle ──────────────────────────────────────────────────────────────
  const [viewType, setViewType] = useState<"tree" | "table">("tree");

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<ICategory[]>([]);   // current page slice
  const [loading, setLoading] = useState(true);

  // ── Pagination + search — single source of truth ──────────────────────────
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);   // total after search filter
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce: 400 ms after user stops typing → reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Core fetch ───────────────────────────────────────────────────────────────
  // fetchCategories now fetches ALL from backend then slices client-side,
  // so page/search filtering is always accurate regardless of backend behaviour.
  const fetchCategory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchCategories(page, LIMIT, debouncedSearch);

      // res.data  → already the correct page slice  (e.g. items 11-14 for page 2)
      // res.total → total after search filter  (used for totalPages calculation)
      setCategories(res.data || []);
      setTotal(typeof res.total === "number" ? res.total : 0);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  // Total pages derived from filtered total
  const totalPages = Math.ceil(total / LIMIT);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddCategory = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: ICategory) => {
    setEditingData(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      // If last item on a non-first page, go back one
      if (categories.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchCategory();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  const handleCreateCategory = async (payload: ICategory) => {
    try {
      await createCategory(payload as any);
    } catch (error) {
      console.error("Create category failed:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
    setPreSelectedCategoryId(null);
  };

  const handleAddSub = (parent: ICategory) => {
    setEditingData(null);
    setPreSelectedCategoryId(parent._id!);
    setIsModalOpen(true);
  };

  const handleSetDefault = async (category: ICategory) => {
    try {
      // await updateCategory(category._id!, { isDefault: true });
      await fetchCategory();
    } catch (error) {
      console.error("Failed to set default:", error);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total",
      value: total,
      subLabel: "Total Categories",
      icon: Layers,
      badge: "Total",
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Active",
      value: categories.filter((c) => c.isActive).length,
      subLabel: "Active (this page)",
      icon: CheckCircle2,
      badge: "Active",
      color: "from-emerald-500 to-teal-400",
    },
    {
      label: "Depth",
      value: getMaxDepth(categories),
      subLabel: "Maximum Levels",
      icon: TreePine,
      badge: "Depth",
      color: "from-purple-500 to-pink-400",
    },
    {
      label: "Root",
      value: categories.filter((c) => !c.parentId).length,
      subLabel: "Root (this page)",
      icon: Folder,
      badge: "Root",
      color: "from-orange-500 to-red-500",
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[1rem] bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 p-8 mb-6 shadow-xl flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <RotatingIcon
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41" fill="none">
                <path d="M13.1373 16.2138L9.33402 10.7277C9.15813 10.4934 9.05488 10.2126 9.03707 9.92014C9.01926 9.62769 9.08767 9.33644 9.23382 9.08251C9.37997 8.82857 9.59744 8.62311 9.85926 8.4916C10.1211 8.36008 10.4157 8.30831 10.7067 8.34268L32.371 11.211C32.6609 11.2535 32.9319 11.3802 33.1505 11.5753C33.369 11.7704 33.5255 12.0254 33.6006 12.3086C33.6756 12.5918 33.6659 12.8909 33.5726 13.1686C33.4793 13.4463 33.3065 13.6906 33.0757 13.8711L27.9758 18.1784L28.421 18.2373C28.7109 18.2799 28.9819 18.4066 29.2005 18.6017C29.419 18.7968 29.5755 19.0518 29.6506 19.335C29.7256 19.6182 29.7159 19.9172 29.6226 20.195C29.5293 20.4727 29.3565 20.7169 29.1257 20.8974L24.0258 25.2048L24.3226 25.2441C24.6293 25.2568 24.9246 25.3636 25.1686 25.5499C25.4126 25.7362 25.5934 25.993 25.6865 26.2855C25.7796 26.578 25.7805 26.8921 25.6892 27.1851C25.5978 27.4782 25.4185 27.736 25.1757 27.9238L18.3955 33.5185L13.3048 26.3521C13.1192 26.1076 13.0132 25.812 13.0013 25.5052C12.9893 25.1985 13.0719 24.8955 13.238 24.6373C13.404 24.3791 13.6454 24.1782 13.9294 24.0619C14.2135 23.9455 14.5264 23.9192 14.8259 23.9867L15.1227 24.026L11.3194 18.5399C11.1435 18.3056 11.0403 18.0248 11.0225 17.7323C11.0047 17.4399 11.0731 17.1486 11.2192 16.8947C11.3654 16.6408 11.5828 16.4353 11.8447 16.3038C12.1065 16.1723 12.4011 16.1205 12.6921 16.1549L13.1373 16.2138Z" stroke="white" strokeWidth="2.99361" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22.1282 5.32529L21.5388 9.77686" stroke="white" strokeWidth="2.99361" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            containerClassName="w-16 h-16 bg-white/20 backdrop-blur-md shadow-inner"
            iconClassName="text-white w-8 h-8"
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Product Categories</h1>
            <p className="text-white/80 mt-1 text-lg">
              Manage hierarchical product category structure
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setViewType((v) => (v === "tree" ? "table" : "tree"))}
            className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl font-semibold transition-all active:scale-95"
          >
            {viewType === "tree"
              ? <><List size={18} /> Table View</>
              : <><Network size={18} /> Tree View</>
            }
          </button>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} gradientClass={stat.color} badgeText={stat.badge} />
        ))}
      </div>

      {/* ── Table / Tree ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[1.5rem] min-h-[400px]">
        <ProductCategories
          categories={categories}        // ← already the correct page slice
          loading={loading}
          searchTerm={search}
          onSearchChange={setSearch}
          totalCount={total}
          onCreate={handleCreateCategory}
          viewType={viewType}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onSub={handleAddSub}
          onSetDefault={handleSetDefault}
          initialCategoryId={preSelectedCategoryId}
        />
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="max-w-[550px]"
        title={editingData ? "Edit Category" : "Add New Category"}
        desicripation="Enter the details for the category structure"
        icon={
          <ShowIcon icon={Tag} size={24} className="text-white" gradientColor="from-purple-500 to-pink-500" />
        }
      >
        <CategoryForm
          editingData={editingData}
          allCategories={categories}
          onClose={handleCloseModal}
          onRefresh={fetchCategory}
          initialCategoryId={preSelectedCategoryId}
        />
      </AnimatedModal>
    </div>
  );
};

export default CategoryDashboard;