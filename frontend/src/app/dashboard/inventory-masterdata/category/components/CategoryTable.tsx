"use client";
import React from "react";
import {
  Folder,
  Layers,
  Tag,
  CheckCircle2,
  XCircle,
  Star,
  Pencil,
  Trash2,
  Plus,
  Search,
} from "lucide-react";
import { ICategory } from "../../../../../../../common/ICategory.interface";

interface Props {
  data: ICategory[];
  loading: boolean;
  /** Controlled by CategoryDashboard — triggers a backend search request */
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  onEdit: (cat: ICategory) => void;
  onDelete: (id: string) => void;
  onAddSub: (parent: ICategory) => void;
}

export const CategoryTable: React.FC<Props> = ({
  data,
  loading,
  searchTerm,
  onSearchChange,
  totalCount,
  onEdit,
  onDelete,
  onAddSub,
}) => {
  const renderRows = (
    categories: ICategory[],
    level: number = 1,
    parentPath: string = ""
  ) => {
    return categories.map((cat) => {
      const currentPath = parentPath
        ? `${parentPath} > ${cat.categoryName}`
        : cat.categoryName;

      const Icon = level === 1 ? Folder : level === 2 ? Layers : Tag;
      const iconColors = ["bg-[#0ea5e9]", "bg-[#d946ef]", "bg-[#10b981]"];
      const currentColor = iconColors[Math.min(level - 1, 2)];

      return (
        <React.Fragment key={cat._id}>
          <tr className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100">
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-2.5 rounded-xl text-white shadow-sm ${currentColor}`}
                  style={{ marginLeft: `${(level - 1) * 8}px` }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 text-[15px]">
                    {cat.categoryName}
                  </span>
                  <span className="text-[12px] text-slate-400 font-medium">
                    {currentPath}
                  </span>
                </div>
              </div>
            </td>

            <td className="px-4 py-4 text-center">
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  level === 1
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : level === 2
                    ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-600"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                }`}
              >
                Level {level}
              </span>
            </td>

            <td className="px-4 py-4 text-center">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${
                  cat.isActive
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {cat.isActive ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                {cat.isActive ? "Active" : "Inactive"}
              </div>
            </td>

            <td className="px-4 py-4 text-center">
              {cat.isDefault ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-600 text-[11px] font-bold">
                  <Star size={13} fill="currentColor" />
                  Default
                </div>
              ) : (
                <div className="text-slate-200 flex justify-center">
                  <Star size={18} />
                </div>
              )}
            </td>

            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onAddSub(cat)}
                  className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-[10px] border border-[#D1D5DC] bg-[#F8F9FF] text-black/80 transition-all duration-200 hover:bg-[#DCFCE7] hover:border-[#22C55E] hover:text-[#22C55E]"
                >
                  <Plus size={14} />
                  Sub
                </button>
                <button
                  onClick={() => onEdit(cat)}
                  className="p-1.5 text-black/80 hover:text-indigo-600 hover:bg-[#DBEAFE] hover:border-[#8EC5FF] rounded-[10px] border border-[#D1D5DC]"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(cat._id!)}
                  className="flex items-center justify-center gap-2 p-1.5 text-black/80 hover:text-red-500 rounded-[10px] border border-[#D1D5DC] hover:border-red-500 hover:bg-[#FFE2E2]"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </td>
          </tr>

          {/* Recurse into children — children are already embedded by the backend */}
          {cat.children &&
            cat.children.length > 0 &&
            renderRows(cat.children, level + 1, currentPath)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="w-full bg-white overflow-hidden">
      {/* Search bar — controlled by dashboard */}
      <div className="flex items-center gap-4 bg-white p-3 border-b border-gray-100">
        <div className="flex items-center gap-2 pl-2 text-gray-500 whitespace-nowrap">
          <Search size={18} />
          <span className="text-sm font-medium">Search:</span>
        </div>
        <input
          type="text"
          placeholder="Search categories by name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 py-2 outline-none text-sm"
        />
        <div className="bg-[#EEF2FF] text-[#6366F1] px-4 py-1.5 rounded-xl text-xs font-bold mr-2">
          {totalCount} categories
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 italic">
          <Folder size={36} strokeWidth={1.2} />
          <p className="text-sm font-medium">
            {searchTerm
              ? `No categories found for "${searchTerm}"`
              : "No categories yet. Click Add Category to get started."}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="border-b border-slate-100">
              <tr className="text-slate-500 text-[12px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Category Hierarchy</th>
                <th className="px-4 py-4 text-center">Level</th>
                <th className="px-4 py-4 text-center">Active</th>
                <th className="px-4 py-4 text-center">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>{renderRows(data)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};