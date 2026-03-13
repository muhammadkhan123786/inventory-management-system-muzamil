"use client";
import React, { useState, useEffect } from "react";
import RotatingIcon from "../../components/RotatingIcon";
import StatCard from "../../components/StatCard";
import { getMaxDepth } from "./utils/GetMaxDepth";
import {
  TreePine,
  Layers,
  CheckCircle2,
  Folder,
  List,
  Plus,
  Tag,
  Network, // Icon for Tree View
} from "lucide-react";
import ShowIcon from "@/components/form/ShowIcons";
import ProductCategories from "./ProductCategories";
import CategoryForm from "./CategoryForm";
import AnimatedModal from "@/components/form/Modal";

// Import your API hook/service
import {
  fetchCategories,
  deleteCategory,
  createCategory,
} from "@/hooks/useCategory";
import { ICategory } from "../../../../../../../common/ICategory.interface";

const CategoryDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<ICategory | null>(null);
  const [selectedParent, setSelectedParent] = useState<ICategory | null>(null);
  const [preSelectedCategoryId, setPreSelectedCategoryId] = useState<
    string | null
  >(null);

  // NEW: State for toggling views
  const [viewType, setViewType] = useState<"tree" | "table">("tree");

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleAddCategory = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: ICategory) => {
    setEditingData(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await deleteCategory(id);
      await fetchCategory(); // refresh list
    } catch (error) {
      console.error("Failed to delete category", error);
      alert("Failed to delete category");
    }
  };

  const handleCreateCategory = async (payload: ICategory) => {
    try {
      await createCategory(payload as any);
    } catch (error) {
      console.log("err", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleAddSub = (parentCategory: any) => {
    setEditingData(null);
    setPreSelectedCategoryId(parentCategory._id); // Store the parent ID
    setIsModalOpen(true);
  };
  // Toggle Function
  const toggleView = () => {
    setViewType((prev) => (prev === "tree" ? "table" : "tree"));
  };

  const handleSetDefault = async (category: ICategory) => {
    try {
      // Assuming you have an updateCategory function in your hooks
      // or a specific endpoint for setting default
      const payload = { ...category, isDefault: true };
      // await axios.patch(`/api/categories/${category._id}/set-default`);
      await fetchCategory(); // Refresh to update stars
    } catch (error) {
      console.error("Failed to set default", error);
    }
  };
  const stats = [
    {
      label: "Total",
      value: categories?.length || 0,
      subLabel: "Total Categories",
      icon: Layers,
      badge: "Total",
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Active",
      value: categories?.filter((c) => c.isActive).length || 0,
      subLabel: "Active Categories",
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
      value: categories?.filter((c) => !c.parentId).length || 0,
      subLabel: "Root Categories",
      icon: Folder,
      badge: "Root",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[1rem] bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 p-8 mb-6 shadow-xl flex items-center justify-between text-white">
        <div className="flex items-center gap-6">
          <RotatingIcon
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="41"
                height="41"
                viewBox="0 0 41 41"
                fill="none"
              >
                <path
                  d="M13.1373 16.2138L9.33402 10.7277C9.15813 10.4934 9.05488 10.2126 9.03707 9.92014C9.01926 9.62769 9.08767 9.33644 9.23382 9.08251C9.37997 8.82857 9.59744 8.62311 9.85926 8.4916C10.1211 8.36008 10.4157 8.30831 10.7067 8.34268L32.371 11.211C32.6609 11.2535 32.9319 11.3802 33.1505 11.5753C33.369 11.7704 33.5255 12.0254 33.6006 12.3086C33.6756 12.5918 33.6659 12.8909 33.5726 13.1686C33.4793 13.4463 33.3065 13.6906 33.0757 13.8711L27.9758 18.1784L28.421 18.2373C28.7109 18.2799 28.9819 18.4066 29.2005 18.6017C29.419 18.7968 29.5755 19.0518 29.6506 19.335C29.7256 19.6182 29.7159 19.9172 29.6226 20.195C29.5293 20.4727 29.3565 20.7169 29.1257 20.8974L24.0258 25.2048L24.3226 25.2441C24.6293 25.2568 24.9246 25.3636 25.1686 25.5499C25.4126 25.7362 25.5934 25.993 25.6865 26.2855C25.7796 26.578 25.7805 26.8921 25.6892 27.1851C25.5978 27.4782 25.4185 27.736 25.1757 27.9238L18.3955 33.5185L13.3048 26.3521C13.1192 26.1076 13.0132 25.812 13.0013 25.5052C12.9893 25.1985 13.0719 24.8955 13.238 24.6373C13.404 24.3791 13.6454 24.1782 13.9294 24.0619C14.2135 23.9455 14.5264 23.9192 14.8259 23.9867L15.1227 24.026L11.3194 18.5399C11.1435 18.3056 11.0403 18.0248 11.0225 17.7323C11.0047 17.4399 11.0731 17.1486 11.2192 16.8947C11.3654 16.6408 11.5828 16.4353 11.8447 16.3038C12.1065 16.1723 12.4011 16.1205 12.6921 16.1549L13.1373 16.2138Z"
                  stroke="white"
                  strokeWidth="2.99361"
                 strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22.1282 5.32529L21.5388 9.77686"
                  stroke="white"
                  strokeWidth="2.99361"
                 strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            containerClassName="w-16 h-16 bg-white/20 backdrop-blur-md shadow-inner"
            iconClassName="text-white w-8 h-8"
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Product Categories
            </h1>
            <p className="text-white/80 mt-1 text-lg">
              Manage hierarchical product category structure
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* VIEW TOGGLE BUTTON */}
          <button
            onClick={toggleView}
            className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl font-semibold transition-all active:scale-95"
          >
            {viewType === "tree" ? (
              <>
                <List size={18} /> Table View
              </>
            ) : (
              <>
                <Network size={18} /> Tree View
              </>
            )}
          </button>

          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-xl font-bold shadow-lg hover:bg-slate-50 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add  Category
          </button>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Main Content Area */}
      <div className="bg-white rounded-[1.5rem]  min-h-[400px]">
        {/* Pass viewType to your ProductCategories component */}
        <ProductCategories
          categories={categories}          
          onCreate={handleCreateCategory}
          viewType={viewType} 
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}         
          onSub={handleAddSub}
          onSetDefault={handleSetDefault}
          initialCategoryId={preSelectedCategoryId}
        />
      </div>

      {/* Animated Modal */}
      <AnimatedModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="max-w-[550px]"
        title={editingData ? "Edit Category" : "Add New Category"}
        desicripation={"Enter the details for the category structure"}
        icon={
          <ShowIcon
            icon={Tag}
            size={24}
            className="text-white"
            gradientColor="from-purple-500 to-pink-500"
          />
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
